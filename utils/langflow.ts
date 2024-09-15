import EventSource from 'eventsource'
interface Input {
  input_value: string
}

export interface TextData {
  text_key: string
  data: {
    text: string
    sender: string
    sender_name: string
    session_id: string
    files: any[]
    timestamp: string
    flow_id: string
  }
  default_value: string
  text: string
}

interface Message {
  message: TextData
}

interface Result {
  results: Message
}

interface Output {
  inputs: Input
  outputs: Result[]
}

export interface FlowResponse {
  session_id: string
  outputs: Output[]
}

export interface StreamFlowResponse {
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
      updatedHeaders = { ...headers }
      // , Authorization: `Bearer ${this.apiKey}` }
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

      return responseMessage as FlowResponse
    } catch (error: any) {
      console.error(`Error during POST request: ${error.message}`)
      throw error
    }
  }

  async initiateSession(
    flowId: string,
    inputValue: string,
    tweaks: {},
    stream: boolean = false
  ): Promise<FlowResponse | StreamFlowResponse> {
    const endpoint = `/api/v1/run/${flowId}?stream=${stream}`

    // tweaks['ChatInput-AzzZf']['input_value'] = inputValue

    return this.post(endpoint, {
      input_value: inputValue,
      output_type: 'chat',
      input_type: 'chat',
      tweaks
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
      console.log('Streamed data: ', data)
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
    tweaks: {},
    stream: boolean = false,
    onUpdate: (data: StreamData) => void,
    onClose: (message: string) => void,
    onError: (error: Event | any) => void
  ): Promise<FlowResponse | StreamFlowResponse | undefined> {
    try {
      const initResponse = await this.initiateSession(
        flowIdOrName,
        inputValue,
        tweaks,
        stream
      )
      if (stream) {
        const streamedResponse = initResponse as StreamFlowResponse

        if (
          streamedResponse?.outputs?.[0]?.outputs?.[0]?.artifacts?.stream_url
        ) {
          const streamUrl =
            streamedResponse.outputs[0]?.outputs[0]?.artifacts?.stream_url

          console.log(`Streaming from: ${streamUrl}`)
          this.handleStream(streamUrl, onUpdate, onClose, onError)
        }
      }
      return initResponse
    } catch (error) {
      onError(error)
    }
  }
}

export async function chatLangflow(
  inputValue: string,
  senderName: string,
  sessionId: string,
  stream: boolean = false,
  onUpdate: (data: StreamData) => void,
  onClose: (message: string) => void,
  onError: (error: Event | any) => void
) {
  const flowIdOrName = process.env.NEXT_PUBLIC_LANGFLOW_ID as string
  const langflowClient = new LangflowClient(
    process.env.NEXT_PUBLIC_LANGFLOW_BACKEND as string,
    process.env.NEXT_PUBLIC_LANGFLOW_API_KEY as string
  )

  const tweaks = {
    'ChatInput-AzzZf': {
      sender_name: senderName,
      session_id: sessionId,
      should_store_message: true
    },
    "TextInput-36cHK": {
      "input_value": sessionId
    }
  }

  try {
    const response = (await langflowClient.runFlow(
      flowIdOrName,
      inputValue,
      tweaks,
      stream,
      onUpdate,
      onClose,
      onError
    )) as FlowResponse

    if (!stream && response) {
      const flowOutputs = response.outputs[0]
      const firstComponentOutputs = flowOutputs.outputs[0]
      const output = firstComponentOutputs.results.message.text

      if (output) {
        console.log('Final Output:', output)

        return output
      }
    }
  } catch (error: any) {
    console.error('Main Error:', error.message)
  }
}
