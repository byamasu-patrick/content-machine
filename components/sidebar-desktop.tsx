import { Sidebar } from '@/components/sidebar'

import { Header } from '@/components/header'
import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat-history'

export async function SidebarDesktop() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className={`flex flex-col h-screen border-r bg-slate-50`}>
        <Header />
      </div>
    )
  }

  return (
    <div
      data-state="closed"
      id="sidebar"
      className="flex flex-col h-screen duration-300 ease-in-out bg-slate-50 data-[state=open]:w-[60px] data-[state=closed]:w-[300px]"
    >
      <Header />
      <Sidebar className="peer absolute mt-16 inset-y-0 z-30 hidden -translate-x-full duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex data-[state=closed]:w-[300px]">
        {/* @ts-ignore */}

        <ChatHistory userId={session.user.id} />
      </Sidebar>
    </div>
  )
}
