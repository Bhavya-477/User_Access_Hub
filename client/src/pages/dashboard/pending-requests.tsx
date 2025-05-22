import { FC, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Check, X, Eye } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PendingRequests: FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Check if user is Manager or Admin
  if (user?.role !== "Manager" && user?.role !== "Admin") {
    return <Redirect to="/dashboard" />;
  }

  // Fetch pending requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/requests/pending"],
    retry: 1,
  });

  // Fetch all users for display names
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    retry: 1,
    enabled: false, // Disabled for now, implement this endpoint if needed
  });

  // Fetch all software for display names
  const { data: software } = useQuery({
    queryKey: ["/api/software"],
    retry: 1,
  });

  // Mutation to approve request
  const approveMutation = useMutation({
    mutationFn: (requestId: number) => {
      return apiRequest("PATCH", `/api/requests/${requestId}`, {
        status: "Approved",
        updatedBy: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Request Approved",
        description: "The access request has been approved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  // Mutation to reject request
  const rejectMutation = useMutation({
    mutationFn: (requestId: number) => {
      return apiRequest("PATCH", `/api/requests/${requestId}`, {
        status: "Rejected",
        updatedBy: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Request Rejected",
        description: "The access request has been rejected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  // Handle approve request
  const handleApproveRequest = (requestId: number) => {
    approveMutation.mutate(requestId);
  };

  // Handle reject request
  const handleRejectRequest = (requestId: number) => {
    rejectMutation.mutate(requestId);
  };

  // Handle view request details
  const handleViewRequestDetails = (request: any) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  // Find software name by ID
  const getSoftwareName = (softwareId: number) => {
    const sw = software?.find((s: any) => s.id === softwareId);
    return sw ? sw.name : `Software #${softwareId}`;
  };

  // Get software description by ID
  const getSoftwareDescription = (softwareId: number) => {
    const sw = software?.find((s: any) => s.id === softwareId);
    return sw ? sw.description : "No description available";
  };

  // Find user name by ID
  const getUserName = (userId: number) => {
    const u = users?.find((u: any) => u.id === userId);
    return u ? u.username : `User #${userId}`;
  };

  // Filter requests based on search query and status filter
  const filteredRequests = requests
    ? requests.filter((request: any) => {
        // Filter by status
        if (statusFilter !== "all" && request.status !== statusFilter) {
          return false;
        }
        
        // Filter by search query (user or software)
        if (searchQuery) {
          const softwareName = getSoftwareName(request.softwareId).toLowerCase();
          const userName = getUserName(request.userId).toLowerCase();
          
          return (
            softwareName.includes(searchQuery.toLowerCase()) ||
            userName.includes(searchQuery.toLowerCase())
          );
        }
        
        return true;
      })
    : [];

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pending Access Requests</h2>
        <p className="text-gray-600 mt-1">
          Review and manage pending software access requests.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">Pending Requests</h3>
          
          <div className="flex">
            <div className="relative">
              <Input 
                type="text" 
                className="pl-10 w-60"
                placeholder="Search by user or software"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-40 ml-3">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : filteredRequests.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Software
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Access Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request: any) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                            <span>{getUserName(request.userId).charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getUserName(request.userId)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getSoftwareName(request.softwareId)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getSoftwareDescription(request.softwareId).length > 30
                            ? `${getSoftwareDescription(request.softwareId).substring(0, 30)}...`
                            : getSoftwareDescription(request.softwareId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.accessType === 'Read' ? 'bg-blue-100 text-blue-800' :
                          request.accessType === 'Write' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {request.accessType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {request.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {request.status === 'Pending' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-green-600 hover:text-green-900 bg-green-100 rounded-full h-8 w-8 p-1"
                                onClick={() => handleApproveRequest(request.id)}
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Check className="h-5 w-5" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-red-600 hover:text-red-900 bg-red-100 rounded-full h-8 w-8 p-1"
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={rejectMutation.isPending}
                              >
                                {rejectMutation.isPending ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <X className="h-5 w-5" />
                                )}
                              </Button>
                            </>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-gray-600 hover:text-gray-900 bg-gray-100 rounded-full h-8 w-8 p-1"
                            onClick={() => handleViewRequestDetails(request)}
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500">No requests found matching your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Full information about this access request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">User</h4>
                <p className="text-base">{getUserName(selectedRequest.userId)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Software</h4>
                <p className="text-base">{getSoftwareName(selectedRequest.softwareId)}</p>
                <p className="text-sm text-gray-500">
                  {getSoftwareDescription(selectedRequest.softwareId)}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Access Type</h4>
                <p className="text-base">{selectedRequest.accessType}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Reason</h4>
                <p className="text-base">{selectedRequest.reason}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <StatusBadge status={selectedRequest.status} size="md" />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Requested On</h4>
                <p className="text-base">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>
              
              {selectedRequest.status !== 'Pending' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                  <p className="text-base">
                    {new Date(selectedRequest.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
              
              {selectedRequest.status === 'Pending' && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRejectRequest(selectedRequest.id);
                      setDialogOpen(false);
                    }}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      "Reject Request"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      handleApproveRequest(selectedRequest.id);
                      setDialogOpen(false);
                    }}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      "Approve Request"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingRequests;
