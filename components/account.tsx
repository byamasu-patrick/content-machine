'use client'

import { Session } from '@/lib/types'
import { SidebarToggle } from './sidebar-toggle'
import { useSidebar } from '@/lib/hooks/use-sidebar'
import { ReactNode } from 'react'

const Account = ({
  session,
  component
}: {
  session: Session
  component: ReactNode
}) => {
  const { isSidebarOpen } = useSidebar()

  return (
    <div className="flex w-full items-center justify-between">
      {session?.user && isSidebarOpen && <>{component}</>}

      <SidebarToggle />
    </div>
  )
}

export default Account
