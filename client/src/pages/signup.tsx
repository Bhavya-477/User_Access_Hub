import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import Logo from "@/components/layout/Logo";

// Form type based on schema
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { signup } = useAuth();

  // Initialize form with react-hook-form
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      role: "Employee",
    },
  });

  // Handle form submission
  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      await signup(data.username, data.password, data.role);
      setLocation("/login");
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </a>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                {...form.register("username")}
                type="text"
                autoComplete="username"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  form.formState.errors.username 
                    ? "border-red-300 placeholder-red-500 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
                } text-gray-900 rounded-t-md focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Username"
              />
              {form.formState.errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                {...form.register("password")}
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  form.formState.errors.password 
                    ? "border-red-300 placeholder-red-500 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
                } text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Password"
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                {...form.register("confirmPassword")}
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  form.formState.errors.confirmPassword 
                    ? "border-red-300 placeholder-red-500 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
                } text-gray-900 rounded-b-md focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Confirm Password"
              />
              {form.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              {...form.register("role")}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-primary-500 group-hover:text-primary-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {isLoading ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
