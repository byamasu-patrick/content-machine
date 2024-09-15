'use client'

import { Session } from '@/lib/types'
import { SidebarToggle } from './sidebar-toggle'
import { UserMenu } from './user-menu'
import { useSidebar } from '@/lib/hooks/use-sidebar'

const Account = ({ session }: { session: Session }) => {
  const { isSidebarOpen } = useSidebar()

  return (
    <div className="flex w-full items-center justify-between">
      {session?.user && isSidebarOpen && <UserMenu user={session.user} />}

      <SidebarToggle />
    </div>
  )
}

export default Account
