import * as React from 'react'

import { shareChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import { UserMessage } from './bot/message'

export interface ChatPanelProps {
  id?: string
  title?: string
  input: string
  setInput: (value: string) => void
  isAtBottom: boolean
  scrollToBottom: () => void
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  isAtBottom,
  scrollToBottom
}: ChatPanelProps) {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const exampleMessages = [
    {
      heading: 'Can you write a comparison article on',
      subheading: 'the top free AI text-to-image generators?',
      message:
        'Can you write a comparison article on the top free AI text-to-image generators like Leonardo AI, Blue Willow, Playground AI, and Dreamlike Art, highlighting their key features and usage benefits?'
    },
    {
      heading: 'What are the unique advantages of',
      subheading: 'Google’s Imagen 3 AI image generator?',
      message:
        'What are the unique advantages of Google’s Imagen 3 AI image generator over other tools in terms of prompt adherence, realism, and text generation, as mentioned in the review?'
    },
    {
      heading: 'Could you create an in-depth review of',
      subheading: 'the best hidden AI tools?',
      message:
        'Could you create an in-depth review of the best hidden AI tools, such as Napkin AI and IDM VTON, discussing their unique use cases and potential impact on productivity?'
    },
    {
      heading: 'How does Grok 2 Mini compare to',
      subheading: 'other large language models like GPT-4 Turbo?',
      message:
        'How does Grok 2 Mini compare to other large language models, like GPT-4 Turbo and Claude 3.5, in terms of performance, prompt handling, and image generation capabilities?'
    }
  ]

  return (
    <div className="w-full">
      <div className="flex justify-center mx-auto sm:max-w-2xl sm:px-4">
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            exampleMessages.map((example, index) => (
              <div
                key={example.heading}
                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                  index > 1 && 'hidden md:block'
                }`}
                onClick={async () => {
                  setMessages(currentMessages => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{example.message}</UserMessage>
                    }
                  ])

                  const responseMessage = await submitUserMessage(
                    example.message
                  )

                  setMessages(currentMessages => [
                    ...currentMessages,
                    responseMessage
                  ])
                }}
              >
                <div className="text-sm font-semibold">{example.heading}</div>
                <div className="text-sm text-zinc-600">
                  {example.subheading}
                </div>
              </div>
            ))}
        </div>

        {messages?.length >= 2 ? (
          <div className="flex h-12 items-center justify-center">
            <div className="flex space-x-2">
              {id && title ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <IconShare className="mr-2" />
                    Share
                  </Button>
                  <ChatShareDialog
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                    onCopy={() => setShareDialogOpen(false)}
                    shareChat={shareChat}
                    chat={{
                      id,
                      title,
                      messages: aiState.messages
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="fixed bottom-0 w-[750px] space-y-4 bg-white px-4 py-4">
          <PromptForm input={input} setInput={setInput} />
        </div>
      </div>

      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  )
}
