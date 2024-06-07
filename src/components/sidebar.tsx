'use client'

import { Book, Brain, HardHat, Home, User } from "lucide-react"
import { SidebarDesktop } from "./sidebar-desktop"
import { SidebarItems } from "@/types"
import { SidebarButton } from "./sidebar-button"

const sidebarItems: SidebarItems = {

  links: [
    { label: 'Home', href: '/', icon: Home},
    { label: 'Courses', href: '/pages/courses', icon: Book},
    { label: 'Jobs', href: '/pages/jobs', icon: HardHat},
    { label: 'Profile', href: '/pages/profile', icon: User},
  ],

  extras: [
    // eslint-disable-next-line react/jsx-key
    <div>

      <SidebarButton className="w-full justify-center mt-5" variant="default">
        Login
      </SidebarButton>
      
    </div>
  ],

}

export function Sidebar() {
  return (
    <SidebarDesktop sidebarItems={sidebarItems} />
  )
}