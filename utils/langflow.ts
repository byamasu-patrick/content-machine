let EventSourceImplementation: any

if (typeof window !== 'undefined') {
  EventSourceImplementation =
    require('event-source-polyfill').EventSourcePolyfill
}

// else {
//   EventSourceImplementation = require('eventsource')
// }

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

class LangflowClient {
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
        console.error(
          `${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`
        )
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
    langflowId: string,
    inputValue: string,
    tweaks: {},
    stream: boolean = false
  ): Promise<FlowResponse | StreamFlowResponse> {
    const endpoint =
      process.env.NODE_ENV === 'development'
        ? `/api/v1/run/${flowId}?stream=${stream}`
        : `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`

    return this.post(
      endpoint,
      {
        input_value: inputValue,
        output_type: 'chat',
        input_type: 'chat',
        tweaks
      },
      {
        'Content-Type': 'application/json'
      }
    )
  }

  async handleStream(
    streamUrl: string,
    onUpdate: (data: StreamData) => void,
    onClose: (message: string) => void,
    onError: (event: Event) => void
  ) {
    const eventSource = new EventSourceImplementation(streamUrl)

    eventSource.onmessage = (event: { data: string }) => {
      const data: StreamData = JSON.parse(event.data)
      console.log('Streamed data: ', data)
      onUpdate(data)
    }

    eventSource.onerror = (event: any) => {
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
    langflowId: string,
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
        langflowId,
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

          console.log(
            `Streaming from: ${streamedResponse?.outputs?.[0]?.outputs?.[0]?.outputs.message?.text}`
          )
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
  const flowIdOrName = process.env.LANGFLOW_FLOW_ID_OR_NAME as string
  const langflowId = process.env.LANGFLOW_ID as string
  const langflowClient = new LangflowClient(
    process.env.LANGFLOW_BACKEND as string,
    process.env.LANGFLOW_API_KEY as string
  )

  const dev = {
    'ChatInput-AzzZf': {
      sender_name: senderName,
      session_id: sessionId,
      should_store_message: true
    },
    'TextInput-36cHK': {
      input_value: sessionId
    }
  }

  const prod = {
    'ChatInput-bLDwq': {
      sender_name: senderName,
      session_id: sessionId,
      should_store_message: true
    },
    'TextInput-zUyJ9': {
      input_value: sessionId
    }
  }

  const tweaks = process.env.NODE_ENV === 'development' ? dev : prod

  console.log(tweaks)

  try {
    const response = (await langflowClient.runFlow(
      flowIdOrName,
      langflowId,
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
        return output
      }
    }
  } catch (error: any) {
    console.error('Main Error:', error.message)
  }
}

export default chatLangflow
