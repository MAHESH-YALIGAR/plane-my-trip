import React, { createContext, useContext, useState } from "react"

/* =========================
   Sidebar Context
========================= */

type SidebarContextType = {
  open: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  const toggle = () => setOpen((prev) => !prev)

  return (
    <SidebarContext.Provider value={{ open, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

/* =========================
   Sidebar Components
========================= */

export function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useSidebar()

  return (
    <aside
      className={`
        h-screen border-r bg-background transition-all duration-300 overflow-hidden
        ${open ? "w-64 md:w-92" : "w-0"} ${className ?? ''}
      `}
    >
      {children}
    </aside>
  )
}

export function SidebarHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center border-b px-4 font-semibold ${className ?? 'h-14'}`}>
      {children}
    </div>
  )
}

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex-1 px-3 py-4 ${className ?? ''}`}>{children}</div>
}

export function SidebarFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-t px-3 py-3 ${className ?? ''}`}>{children}</div>
}

/* =========================
   Menu Components
========================= */

export function SidebarMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ul className={`space-y-2 ${className ?? ''}`}>{children}</ul>
}

export function SidebarMenuItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={className ?? ''}>{children}</li>
}

export function SidebarMenuButton({
  children,
  active = false,
  onClick,
  className,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}) {
  const { open } = useSidebar()

  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-center gap-3 rounded-md px-4 py-3 text-base transition-all duration-200
        ${active ? "bg-muted font-medium" : "hover:bg-muted"}
        ${!open ? "justify-center" : "justify-start"} ${className ?? ''}
      `}
    >
      {children}
    </button>
  )
}

/* =========================
   Toggle Button
========================= */

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar()

  return (
    <button
      onClick={toggle}
      className={`rounded-md border px-3 py-2 text-sm hover:bg-muted ${className ?? ''}`}
    >
      ☰
    </button>
  )
}

/* =========================
   Example Usage
========================= */

export default function App() {
  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar>
          <SidebarHeader>
            <span>My App</span>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton active>🏠 Dashboard</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>👤 Profile</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>⚙️ Settings</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenuButton>🚪 Logout</SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-6">
          <SidebarTrigger />
          <h1 className="mt-4 text-2xl font-bold">Dashboard</h1>
        </main>
      </div>
    </SidebarProvider>
  )
}
