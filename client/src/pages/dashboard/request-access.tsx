import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRequestSchema } from "@shared/schema";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import StatusBadge from "@/components/ui/status-badge";

// Form type
type RequestFormValues = z.infer<typeof createRequestSchema> & {
  duration?: string;
};

const RequestAccess: FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [softwareOptions, setSoftwareOptions] = useState<any[]>([]);
  const [accessLevelOptions, setAccessLevelOptions] = useState<string[]>([]);

  // Check if user is Employee or Admin
  if (user?.role !== "Employee" && user?.role !== "Admin") {
    return <Redirect to="/dashboard" />;
  }

  // Initialize form with react-hook-form
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(createRequestSchema.extend({
      duration: z.string().optional(),
    })),
    defaultValues: {
      userId: user?.id,
      softwareId: 0,
      accessType: undefined,
      reason: "",
      duration: "30days",
    },
  });

  // Get all software
  const { data: allSoftware, isLoading: isSoftwareLoading } = useQuery({
    queryKey: ["/api/software"],
    retry: 1,
  });

  // Get my requests
  const { data: myRequests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ["/api/requests/my"],
    retry: 1,
  });

  // Update software options when data is loaded
  useEffect(() => {
    if (allSoftware) {
      setSoftwareOptions(allSoftware);
    }
  }, [allSoftware]);

  // Update access level options when software changes
  const handleSoftwareChange = (value: string) => {
    const softwareId = parseInt(value);
    form.setValue("softwareId", softwareId);
    
    // Clear current access type
    form.setValue("accessType", undefined);
    
    // Find selected software
    const selectedSoftware = softwareOptions.find(sw => sw.id === softwareId);
    
    if (selectedSoftware) {
      setAccessLevelOptions(selectedSoftware.accessLevels);
    } else {
      setAccessLevelOptions([]);
    }
  };

  // Mutation to create request
  const mutation = useMutation({
    mutationFn: (data: RequestFormValues) => {
      // Remove duration from data before sending to API
      const { duration, ...apiData } = data;
      return apiRequest("POST", "/api/requests", apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Request Submitted",
        description: "Your access request has been submitted successfully.",
      });
      
      // Reset form
      form.reset({
        userId: user?.id,
        softwareId: 0,
        accessType: undefined,
        reason: "",
        duration: "30days",
      });
      
      setAccessLevelOptions([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: RequestFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Request Software Access</h2>
        <p className="text-gray-600 mt-1">
          Submit a request for access to software applications.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="software" className="block text-sm font-medium text-gray-700">
                Software
              </label>
              <Select
                onValueChange={handleSoftwareChange}
                value={form.watch("softwareId") ? form.watch("softwareId").toString() : ""}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select software" />
                </SelectTrigger>
                <SelectContent>
                  {isSoftwareLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                    </div>
                  ) : softwareOptions.length > 0 ? (
                    softwareOptions.map((sw) => (
                      <SelectItem key={sw.id} value={sw.id.toString()}>
                        {sw.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">No software available</div>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.softwareId && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.softwareId.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="accessType" className="block text-sm font-medium text-gray-700">
                Access Type
              </label>
              <Select
                onValueChange={(value) => form.setValue("accessType", value as "Read" | "Write" | "Admin")}
                value={form.watch("accessType")}
                disabled={!form.watch("softwareId") || accessLevelOptions.length === 0}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select access type" />
                </SelectTrigger>
                <SelectContent>
                  {accessLevelOptions.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.accessType && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.accessType.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason for Access
              </label>
              <Textarea
                id="reason"
                {...form.register("reason")}
                rows={3}
                className="mt-1"
                placeholder="Explain why you need access to this software"
              />
              <p className="mt-1 text-sm text-gray-500">
                Please provide a detailed justification for your access request.
              </p>
              {form.formState.errors.reason && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.reason.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <Select
                onValueChange={(value) => form.setValue("duration", value)}
                value={form.watch("duration")}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">30 days</SelectItem>
                  <SelectItem value="90days">90 days</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-3"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* My Requests Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">My Access Requests</h3>
        
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isRequestsLoading ? (
                <div className="py-16 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : myRequests && myRequests.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Software
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Access Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myRequests.map((request: any) => {
                      const software = softwareOptions.find(sw => sw.id === request.softwareId);
                      
                      return (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {software ? software.name : `Software #${request.softwareId}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {software ? 
                                (software.description.length > 30 
                                  ? `${software.description.substring(0, 30)}...` 
                                  : software.description) 
                                : "No description available"}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="link"
                              className="text-primary-600 hover:text-primary-900 p-0 h-auto font-medium"
                              onClick={() => {
                                // Implement view details functionality
                                toast({
                                  title: "Request Details",
                                  description: `Reason: ${request.reason}`,
                                });
                              }}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500">You haven't made any requests yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestAccess;
