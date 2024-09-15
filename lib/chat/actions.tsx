import 'server-only'

import {
  createAI,
  getMutableAIState,
  getAIState,
  createStreamableValue
} from 'ai/rsc'
import { BotMessage } from '@/components/stocks'

import { nanoid } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { UserMessage } from '@/components/stocks/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'
import { chatLangflow, StreamData } from '@/utils/langflow'
import { Session } from '@/lib/types'

async function submitUserMessage(content: string) {
  'use server'

  const session = (await auth()) as Session

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const updateMessageStream = (data: StreamData) => {
    if (textStream) {
      textStream.update(data.chunk)
    }
  }

  const closeMessageStream = (message: string) => {
    if (!textStream) {
      textStream = createStreamableValue('')
      textNode = <BotMessage content={textStream.value} />
    }

    textStream.done()
    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'assistant',
          content: message
        }
      ]
    })
  }

  const handleError = (event: Event) => {
    console.log('An error has occurred please try again', event)
  }

  const result = await chatLangflow(
    content,
    session?.user.email as string,
    session?.user?.id as string,
    false,
    updateMessageStream,
    closeMessageStream,
    handleError
  )

  textNode = <BotMessage content={result as string} />

  return {
    id: nanoid(),
    display: textNode
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
