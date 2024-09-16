'use client'

import * as React from 'react'

import { useSidebar } from '@/lib/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import { IconSidebar } from '@/components/ui/icons'

export function SidebarToggle() {
  const { toggleSidebar, isSidebarOpen } = useSidebar()

  return (
    <Button
      variant="ghost"
      className="hidden size-9 p-0 lg:flex hover:bg-slate-100"
      onClick={() => {
        const sidebar = document.getElementById('sidebar')
        const sidebarHeader = document.getElementById('sidebar-header')

        if (sidebar) {
          const currentState = sidebar.getAttribute('data-state')
          const newState = currentState === 'open' ? 'closed' : 'open'

          // Toggle data-state attribute
          sidebar.setAttribute('data-state', newState)
          sidebarHeader?.setAttribute('data-state', newState)

          if (newState === 'closed') {
            sidebar.classList.add('bg-slate-50')
          } else {
            sidebar.classList.remove('bg-slate-50')
          }
        }

        toggleSidebar()
      }}
    >
      <IconSidebar className="size-6" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
