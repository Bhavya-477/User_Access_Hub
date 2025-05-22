import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Database, Clock, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const DashboardHome: FC = () => {
  const { user } = useAuth();

  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: 1,
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["/api/requests/recent"],
    enabled: false, // Disabled for now, implement this endpoint if needed
  });

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.username}
        </h2>
        <p className="text-gray-600 mt-1">
          Here's an overview of your access management system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Software Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <Database className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Software
                </p>
                {isLoading ? (
                  <div className="flex items-center mt-1">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-800">
                    {stats?.totalSoftware || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Pending Requests
                </p>
                {isLoading ? (
                  <div className="flex items-center mt-1">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-800">
                    {stats?.pendingRequests || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Users Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                {isLoading ? (
                  <div className="flex items-center mt-1">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-800">
                    {stats?.totalUsers || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Recent Activity</h3>
        </div>
        <CardContent className="p-6">
          <div className="flow-root">
            {isLoadingActivity ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <ul className="-mb-8">
                {/* Map through recent activities here */}
                <li className="mb-6">
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <Database className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-800">
                            No recent activity
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
