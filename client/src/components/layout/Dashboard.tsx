import { FC, ReactNode, useState, useEffect } from "react";
import { Redirect } from "wouter";
import Sidebar from "./Sidebar";
import { Menu, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";

interface DashboardProps {
  children: ReactNode;
}

const Dashboard: FC<DashboardProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  // Get the page title based on the current location
  const getPageTitle = () => {
    if (location === "/dashboard") return "Dashboard";
    if (location === "/dashboard/create-software") return "Create Software";
    if (location === "/dashboard/pending-requests") return "Pending Requests";
    if (location === "/dashboard/request-access") return "Request Access";
    if (location === "/dashboard/my-requests") return "My Requests";
    if (location === "/dashboard/approval-history") return "Approval History";
    if (location === "/dashboard/profile") return "Profile Settings";
    if (location === "/dashboard/manage-users") return "Manage Users";
    return "Dashboard";
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar for desktop */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar with Sheet component */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar isMobile onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="bg-white shadow-sm z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <SheetTrigger asChild className="md:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="px-4 text-gray-500"
                    >
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
                  </div>
                </div>
                <div className="ml-6 flex items-center">
                  <div className="ml-3 relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 bg-primary-600 text-white"
                        >
                          <span className="sr-only">Open user menu</span>
                          <span>{user?.username.charAt(0).toUpperCase()}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => window.location.href = "/dashboard/profile"}
                        >
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => window.location.href = "/dashboard/settings"}
                        >
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600"
                          onClick={logout}
                        >
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
