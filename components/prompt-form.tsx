'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'

import { BotCard, BotMessage, SpinnerMessage, UserMessage } from './bot/message'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowUp } from '@/components/ui/icons'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import FileUploader from './ui/file-uploader'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleUploadFile = async (file: File) => {
    try {
      if (file.type.startsWith('image/')) {
        // return await handleUploadImageFile(file);
        console.log('Uploaded the file')
      }
      // props.onFileUpload?.(file);
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // props.onFileError?.(error.message);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()

        // Blur focus on mobile
        if (typeof window !== 'undefined' && window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        const botMessageId = nanoid()
        // Optimistically add user message UI
        setMessages(currentMessages => [
          ...currentMessages,
          {
            id: nanoid(),
            display: <UserMessage>{value}</UserMessage>
          },
          {
            id: botMessageId,
            display: <SpinnerMessage />
          }
        ])
        // Submit and get response message
        const responseMessage = await submitUserMessage(value, botMessageId)
        // setMessages(currentMessages => [...currentMessages, responseMessage])
        setMessages(currentMessages => {
          const updatedMessages = [...currentMessages]
          const index = updatedMessages.findIndex(
            message => message.id === botMessageId
          )

          updatedMessages[index] = responseMessage

          return updatedMessages
        })
      }}
    >
      <div className="bg-white sm:rounded-md mb-4 p-4 sm:border">
        <div className="flex max-h-60 w-full grow overflow-hidden">
          <Textarea
            ref={inputRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            placeholder="Send a message."
            className="min-h-[60px] w-full resize-none bg-white px-2 focus-within:outline-none sm:text-sm"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            name="message"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <div className="">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  disabled={input === ''}
                  className="flex justify-center items-center rounded-3xl"
                >
                  <IconArrowUp />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
        </div>

        <div className="flex justify-between">
          <FileUploader
            onFileUpload={handleUploadFile}
            onFileError={() => console.log('An error has occurred')}
          />
          <small>
            Use{' '}
            <span className="text-xs rounded-sm bg-slate-100 p-1">
              shift + return
            </span>{' '}
            for new line
          </small>
        </div>
      </div>
    </form>
  )
}
