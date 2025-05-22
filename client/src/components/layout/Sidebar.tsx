import { FC } from "react";
import { useLocation, Link } from "wouter";
import Logo from "./Logo";
import { 
  Home, 
  Plus, 
  Users, 
  FileText, 
  Clock, 
  Key, 
  ClipboardList,
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isMobile, onClose }) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Helper to determine if a link is active
  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };
  
  // Handle sidebar item click on mobile
  const handleItemClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    handleItemClick();
  };

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Logo size="sm" />
        <span className="ml-2 font-semibold text-gray-800">Access Manager</span>
      </div>
      
      <div className="py-4 px-2 flex-1 overflow-y-auto">
        {/* User Info */}
        <div className="px-4 py-3 mb-6 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              <span>{user?.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <div className="flex items-center">
                <p className="text-xs text-gray-500">{user?.role}</p>
                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                  user?.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav>
          <div className="space-y-1">
            {/* Common Links - Everyone */}
            <Link href="/dashboard">
              <a 
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive("/dashboard") && location === "/dashboard" 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={handleItemClick}
              >
                <Home className="w-5 h-5 mr-2 text-gray-500" />
                Dashboard
              </a>
            </Link>

            {/* Admin Links */}
            {user?.role === "Admin" && (
              <>
                <Link href="/dashboard/create-software">
                  <a 
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      isActive("/dashboard/create-software") 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={handleItemClick}
                  >
                    <Plus className="w-5 h-5 mr-2 text-gray-500" />
                    Create Software
                  </a>
                </Link>
                <Link href="/dashboard/manage-users">
                  <a 
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      isActive("/dashboard/manage-users") 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={handleItemClick}
                  >
                    <Users className="w-5 h-5 mr-2 text-gray-500" />
                    Manage Users
                  </a>
                </Link>
              </>
            )}

            {/* Manager Links */}
            {(user?.role === "Manager" || user?.role === "Admin") && (
              <>
                <Link href="/dashboard/pending-requests">
                  <a 
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      isActive("/dashboard/pending-requests") 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={handleItemClick}
                  >
                    <FileText className="w-5 h-5 mr-2 text-gray-500" />
                    Pending Requests
                  </a>
                </Link>
                <Link href="/dashboard/approval-history">
                  <a 
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      isActive("/dashboard/approval-history") 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={handleItemClick}
                  >
                    <Clock className="w-5 h-5 mr-2 text-gray-500" />
                    Approval History
                  </a>
                </Link>
              </>
            )}

            {/* Employee Links */}
            {(user?.role === "Employee" || user?.role === "Admin") && (
              <>
                <Link href="/dashboard/request-access">
                  <a 
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      isActive("/dashboard/request-access") 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={handleItemClick}
                  >
                    <Key className="w-5 h-5 mr-2 text-gray-500" />
                    Request Access
                  </a>
                </Link>
                <Link href="/dashboard/my-requests">
                  <a 
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      isActive("/dashboard/my-requests") 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={handleItemClick}
                  >
                    <ClipboardList className="w-5 h-5 mr-2 text-gray-500" />
                    My Requests
                  </a>
                </Link>
              </>
            )}

            {/* Settings & Logout */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link href="/dashboard/profile">
                <a 
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive("/dashboard/profile") 
                      ? "bg-gray-100 text-gray-900" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={handleItemClick}
                >
                  <Settings className="w-5 h-5 mr-2 text-gray-500" />
                  Profile Settings
                </a>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start px-4 py-2 h-9 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2 text-gray-500" />
                Logout
              </Button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
