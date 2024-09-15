export interface Tweaks {
  [key: string]: object
}

export interface FlowResponse {
  outputs: Array<{
    outputs: Array<{
      artifacts: any
      outputs: {
        message?: {
          text: string
        }
        artifacts?: {
          stream_url?: string
        }
      }
    }>
  }>
}

export interface StreamData {
  chunk: string
}

export class LangflowClient {
  baseURL: string
  apiKey: string

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL
    this.apiKey = apiKey
  }

  async post(
    endpoint: string,
    body: object,
    headers = { 'Content-Type': 'application/json' }
  ): Promise<any> {
    let updatedHeaders = {}
    if (this.apiKey) {
      updatedHeaders = { ...headers, Authorization: `Bearer ${this.apiKey}` }
    } else {
      updatedHeaders = headers
    }

    const url = `${this.baseURL}${endpoint}`
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: updatedHeaders,
        body: JSON.stringify(body)
      })

      const responseMessage = await response.json()
      if (!response.ok) {
        throw new Error(
          `${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`
        )
      }
      return responseMessage
    } catch (error: any) {
      console.error(`Error during POST request: ${error.message}`)
      throw error
    }
  }

  async initiateSession(
    flowId: string,
    inputValue: string,
    stream: boolean = false
  ): Promise<FlowResponse> {
    const endpoint = `/api/v1/run/${flowId}?stream=${stream}`
    return this.post(endpoint, {
      input_value: inputValue
    })
  }

  handleStream(
    streamUrl: string,
    onUpdate: (data: StreamData) => void,
    onClose: (message: string) => void,
    onError: (event: Event) => void
  ): EventSource {
    const eventSource = new EventSource(streamUrl)

    eventSource.onmessage = event => {
      const data: StreamData = JSON.parse(event.data)
      onUpdate(data)
    }

    eventSource.onerror = event => {
      console.error('Stream Error:', event)
      onError(event)
      eventSource.close()
    }

    eventSource.addEventListener('close', () => {
      onClose('Stream closed')
      eventSource.close()
    })

    return eventSource
  }

  async runFlow(
    flowIdOrName: string,
    inputValue: string,
    stream: boolean = false,
    onUpdate: (data: StreamData) => void,
    onClose: (message: string) => void,
    onError: (error: Event | any) => void
  ): Promise<FlowResponse | undefined> {
    try {
      const initResponse = await this.initiateSession(
        flowIdOrName,
        inputValue,
        stream
      )
      if (
        stream &&
        initResponse?.outputs?.[0]?.outputs?.[0]?.artifacts?.stream_url
      ) {
        const streamUrl = (
          initResponse.outputs[0]?.outputs[0]?.artifacts as {
            stream_url?: string | undefined
          }
        ).stream_url as string
        console.log(`Streaming from: ${streamUrl}`)
        this.handleStream(streamUrl, onUpdate, onClose, onError)
      }
      return initResponse
    } catch (error) {
      onError(error)
    }
  }
}

export async function chatLangflow(
  inputValue: string,
  stream: boolean = false
) {
  const flowIdOrName = process.env.NEXT_PUBLIC_LANGFLOW_ID as string
  const langflowClient = new LangflowClient(
    process.env.NEXT_PUBLIC_LANGFLOW_BACKEND as string,
    process.env.NEXT_PUBLIC_LANGFLOW_API_KEY as string
  )

  try {
    const response = await langflowClient.runFlow(
      flowIdOrName,
      inputValue,
      stream,
      data => console.log('Received:', data.chunk),
      message => console.log('Stream Closed:', message),
      error => console.error('Stream Error:', error)
    )

    if (!stream && response) {
      const flowOutputs = response.outputs[0]
      const firstComponentOutputs = flowOutputs.outputs[0]
      const output = firstComponentOutputs.outputs.message

      if (output) {
        console.log('Final Output:', output.text)
      }
    }
  } catch (error: any) {
    console.error('Main Error:', error.message)
  }
}
