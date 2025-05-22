import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/components/layout/Dashboard";
import DashboardHome from "@/pages/dashboard";
import CreateSoftware from "@/pages/dashboard/create-software";
import PendingRequests from "@/pages/dashboard/pending-requests";
import RequestAccess from "@/pages/dashboard/request-access";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

function Router() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Handle role-based redirects after login
  useEffect(() => {
    if (isAuthenticated && location === "/") {
      // Redirect based on role
      if (user?.role === "Admin") {
        setLocation("/dashboard/create-software");
      } else if (user?.role === "Manager") {
        setLocation("/dashboard/pending-requests");
      } else if (user?.role === "Employee") {
        setLocation("/dashboard/request-access");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, user, location, setLocation]);

  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={Login}/>
      <Route path="/signup" component={Signup}/>
      
      {/* Dashboard Routes */}
      <Route path="/dashboard">
        <Dashboard>
          <Route path="/" component={DashboardHome} />
          <Route path="/create-software" component={CreateSoftware} />
          <Route path="/pending-requests" component={PendingRequests} />
          <Route path="/request-access" component={RequestAccess} />
        </Dashboard>
      </Route>
      
      {/* Redirect to login or dashboard based on auth status */}
      <Route path="/">
        {isAuthenticated ? <Dashboard><DashboardHome /></Dashboard> : <Login />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
