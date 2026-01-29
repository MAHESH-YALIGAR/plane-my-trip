import React, { useState } from 'react'
import axios from 'axios'
import { motion } from "framer-motion"
import { href, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "./ShadcnLikeSidebar"
import { MapPin, Navigation, Zap, CreditCard, BarChart3, LogOut, Settings } from 'lucide-react'

function Newsidebar() {
  const [activeMenu, setActiveMenu] = useState('plan')
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      console.log("✅ Logged out successfully")
      navigate('/login')
    } catch (error) {
      console.error("❌ Logout error:", error)
      alert("Error logging out. Please try again.")
    }
  }
  const menuItems = [
    { id: 'plan', icon: Navigation, label: 'Plan Trip', path: "/PlanTrip", color: 'from-blue-500 to-cyan-500' },
    { id: 'places', icon: MapPin, label: 'Nearby Places', path: "/RouteDistancePage", color: 'from-purple-500 to-pink-500' },
    { id: 'route', icon: Zap, label: 'Route & Distance', path: "/RouteDistancePage", color: 'from-orange-500 to-red-500' },
    { id: 'expense', icon: CreditCard, label: 'Expense Split', path: "/expencive", color: 'from-green-500 to-emerald-500' },
    { id: 'summary', icon: BarChart3, label: 'Trip Summary', path: "/summery", color: 'from-indigo-500 to-blue-500' },
  ]

  const handleMenuClick = (path) => {
    navigate(path)
  }



  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar className="border-r border-slate-200 shadow-lg">
            {/* Header */}
            <SidebarHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <div className="flex flex-col gap-1 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✈️</span>
                  <span className="text-xl p-4 font-bold">Plan My Trip</span>
                </div>
                <span className="text-xs text-black">
                  Your smart travel companion
                </span>
              </div>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className="px-3 py-4">


              <SidebarMenu className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeMenu === item.id

                  return (
                    <SidebarMenuItem key={item.id}>
                      <button
                        onClick={() => {
                          setActiveMenu(item.id)
                          handleMenuClick(item.path)
                        }}
                        className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group w-full
          ${isActive
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                            : "text-slate-700 hover:bg-slate-100"
                          }`}
                      >
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full opacity-70" />
                        )}

                        <Icon className="h-6 w-6 flex-shrink-0" />
                        <span className="font-medium text-base md:text-lg">
                          {item.label}
                        </span>
                      </button>
                    </SidebarMenuItem>
                  )
                })}

              </SidebarMenu>
              {/* removed extra info card to keep UI focused */}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="border-t border-slate-200 gap-3 p-3">
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all duration-300 cursor-pointer group">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-sm">
                  M
                </div>
                <div className="text-sm flex-1">
                  <p className="font-semibold text-slate-900 text-base">Mahesh</p>
                  <p className="text-xs text-slate-500">Traveller</p>
                </div>
              </div>

              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-red-600 transition-all duration-300 group text-sm font-medium">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>

              <button className="flex hover:bg-blue-300 items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-slate-600  transition-all duration-300 text-sm">
                <Settings className="h-4   w-4" />
              </button>
            </SidebarFooter>
      </Sidebar>

      <div className='text-black'>
        <SidebarTrigger />
      </div>

    </div>
  )
}

export default Newsidebar
