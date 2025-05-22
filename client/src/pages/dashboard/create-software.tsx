import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSoftwareSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

// Form type based on schema
type SoftwareFormValues = z.infer<typeof createSoftwareSchema>;

const CreateSoftware: FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is Admin
  if (user?.role !== "Admin") {
    return <Redirect to="/dashboard" />;
  }

  // Initialize form with react-hook-form
  const form = useForm<SoftwareFormValues>({
    resolver: zodResolver(createSoftwareSchema),
    defaultValues: {
      name: "",
      description: "",
      accessLevels: ["Read", "Write", "Admin"],
      createdBy: user?.id || 0,
    },
  });

  // Mutation to create software
  const mutation = useMutation({
    mutationFn: (data: SoftwareFormValues) => {
      return apiRequest("POST", "/api/software", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/software"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Software Created",
        description: "The software has been added successfully.",
      });
      
      // Reset form
      form.reset({
        name: "",
        description: "",
        accessLevels: ["Read", "Write", "Admin"],
        createdBy: user?.id || 0,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create software",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: SoftwareFormValues) => {
    mutation.mutate(data);
  };

  // Handle access level checkboxes
  const handleAccessLevelChange = (level: string, checked: boolean) => {
    const currentLevels = form.getValues().accessLevels || [];
    
    if (checked) {
      form.setValue("accessLevels", [...currentLevels, level] as ["Read", "Write", "Admin"]);
    } else {
      form.setValue(
        "accessLevels", 
        currentLevels.filter((l) => l !== level) as ["Read", "Write", "Admin"]
      );
    }
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Software</h2>
        <p className="text-gray-600 mt-1">
          Add a new software application to the access management system.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="software-name" className="block text-sm font-medium text-gray-700">
                Software Name
              </label>
              <Input
                id="software-name"
                {...form.register("name")}
                className="mt-1"
                placeholder="e.g. Adobe Photoshop"
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="software-description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                id="software-description"
                {...form.register("description")}
                rows={3}
                className="mt-1"
                placeholder="Describe the software and its purpose"
              />
              {form.formState.errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Access Levels</label>
              <p className="text-xs text-gray-500 mb-2">
                Select all access levels available for this software
              </p>

              <div className="space-y-2">
                <div className="flex items-start">
                  <Checkbox
                    id="access-read"
                    checked={form.watch("accessLevels")?.includes("Read")}
                    onCheckedChange={(checked) => handleAccessLevelChange("Read", checked as boolean)}
                  />
                  <div className="ml-3 text-sm">
                    <label htmlFor="access-read" className="font-medium text-gray-700">
                      Read
                    </label>
                    <p className="text-gray-500">Can view data but cannot modify anything</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Checkbox
                    id="access-write"
                    checked={form.watch("accessLevels")?.includes("Write")}
                    onCheckedChange={(checked) => handleAccessLevelChange("Write", checked as boolean)}
                  />
                  <div className="ml-3 text-sm">
                    <label htmlFor="access-write" className="font-medium text-gray-700">
                      Write
                    </label>
                    <p className="text-gray-500">Can view and modify data</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Checkbox
                    id="access-admin"
                    checked={form.watch("accessLevels")?.includes("Admin")}
                    onCheckedChange={(checked) => handleAccessLevelChange("Admin", checked as boolean)}
                  />
                  <div className="ml-3 text-sm">
                    <label htmlFor="access-admin" className="font-medium text-gray-700">
                      Admin
                    </label>
                    <p className="text-gray-500">Full administrative access to all features</p>
                  </div>
                </div>
              </div>
              
              {form.formState.errors.accessLevels && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.accessLevels.message}
                </p>
              )}
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
                    Creating...
                  </>
                ) : (
                  "Create Software"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSoftware;
