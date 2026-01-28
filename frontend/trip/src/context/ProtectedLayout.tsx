// layouts/ProtectedLayout.jsx
import { Outlet } from "react-router-dom";
import Newsidebar from "@/components/Newsidebar";

export default function ProtectedLayout() {
  return (
    <div className="flex">
      <div className="fixed">
        <Newsidebar />
      </div>
      <div className="flex-1 ml-64">
        <Outlet />
      </div>
    </div>
  );
}
