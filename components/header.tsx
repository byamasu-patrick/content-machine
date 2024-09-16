import * as React from 'react'
import Link from 'next/link'

import { auth } from '@/auth'
import { IconNextChat } from '@/components/ui/icons'
import { SidebarMobile } from './sidebar-mobile'
import { ChatHistory } from './chat-history'
import { Session } from '@/lib/types'
import Account from './account'
import { redirect } from 'next/navigation'
import { UserMenu } from './user-menu'

async function UserOrLogin() {
  const session = (await auth()) as Session

  if (!session) {
    redirect('/login')
  }

  return (
    <>
      {session?.user ? (
        <>
          <SidebarMobile>
            <ChatHistory userId={session.user.id} />
          </SidebarMobile>
        </>
      ) : (
        <Link href="/new" rel="nofollow">
          <IconNextChat className="size-6 mr-2 dark:hidden" inverted />
          <IconNextChat className="hidden size-6 mr-2 dark:block" />
        </Link>
      )}

      <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <Account
          session={session}
          component={<UserMenu user={session.user} />}
        />
      </React.Suspense>
    </>
  )
}

export function Header() {
  return (
    <header
      data-state="closed"
      id="sidebar-header"
      className="flex items-center justify-between duration-300 px-4 ease-in-out h-16  data-[state=open]:w-[60px] data-[state=closed]:w-[300px]"
    >
      <div className="flex items-center w-full">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
    </header>
  )
}
