// layouts/ProtectedLayout.jsx
import { Outlet } from "react-router-dom";
import Newsidebar from "@/components/Newsidebar";
import { SidebarProvider, useSidebar } from "@/components/ShadcnLikeSidebar";

function ContentArea() {
  const { open } = useSidebar();
  return (
    <div className={`flex-1 transition-all duration-300 ${open ? 'ml-64' : 'ml-0'}`}>
      <Outlet />
    </div>
  );
}

export default function ProtectedLayout() {
  return (
    <SidebarProvider>
      <div className="flex">
        <div className="fixed">
          <Newsidebar />
        </div>
        <ContentArea />
      </div>
    </SidebarProvider>
  );
}
