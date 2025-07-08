"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { User } from "@/types";
import Image from "next/image";
import api from "@/lib/axiosInstance";
import { toast } from "sonner";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const passwordResetSchema = z.object({
  currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
  newPassword: z.string()
    .min(8, "New password must meet security requirements")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Must contain uppercase, number, and special character"
    ),
});

const forgotPasswordSchema = z.object({
  username: z.string().min(1, "Username is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Must contain uppercase, number, and special character"
    ),
});

export default function PeoplePulseAuthGateway() {
  const [isResetting, setIsResetting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { update } = useUserStore();

  const form = useForm({
    resolver: zodResolver(
      isForgotPassword ? forgotPasswordSchema :
        isResetting ? passwordResetSchema : loginSchema
    ),
    defaultValues: {
      username: "",
      password: "",
      currentPassword: "",
      newPassword: ""
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset();
  }, [isResetting, isForgotPassword, form]);

  const handleAuthSubmission = async (
    data: z.infer<typeof loginSchema> |
      z.infer<typeof passwordResetSchema> |
      z.infer<typeof forgotPasswordSchema>
  ) => {
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        await handlePasswordReset(data as z.infer<typeof forgotPasswordSchema>);
        return;
      }

      if ("username" in data && "password" in data) {
        await handleLogin(data as z.infer<typeof loginSchema>);
      }
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (credentials: z.infer<typeof loginSchema>) => {
    const response = await api.post("Auth/generate_token", {
      userName: credentials.username,
      password: credentials.password,
    });

    const user: User = {
      id: response.data.userId,
      name: credentials.username,
      email: response.data.email,
      userProfileUrl: "https://github.com/shadcn.png",
      role: response.data.accessTypeName.toLowerCase(),
      token: response.data.token,
      roleId: response.data.accessTypeID,
      resourceID: response.data.resourceID,
      pmID: response.data.pmid,
      rmID: response.data.rmid,
      supplierID: response.data.supplierID,
    };

    update(user);
    document.cookie = `accessToken=${response.data.token}; path=/; SameSite=Lax`;
    router.push(`/${response.data.accessTypeName.toLowerCase()}`);
  };

  const handlePasswordReset = async (data: z.infer<typeof forgotPasswordSchema>) => {
    await api.patch("/User/change-password", {
      username: data.username,
      newPassword: data.newPassword,
      forgotPassword: true,
    });

    toast.success("Password reset successful. Please login with your new password.");
    setIsForgotPassword(false);
    form.reset();
  };

  const handleAuthError = (error: any) => {
    console.error("Authentication error:", error);
    const errorMessage = error.response?.data?.message ||
      "Invalid credentials. Please try again.";

    toast.error(errorMessage);
    form.reset({
      username: "",
      password: "",
      currentPassword: "",
      newPassword: ""
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="mb-6 flex justify-center">
          <Image
            src="/PeoplePulseFinal1.png"
            height={70}
            width={70}
            alt="Logo"
            priority
          />
        </div>

        <h1 className="text-center text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
          {isForgotPassword
            ? "Reset Password"
            : isResetting
              ? "Secure Password Reset"
              : "Employee Authentication Portal"}
        </h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAuthSubmission)}
            className="space-y-6"
          >
            {isForgotPassword ? (
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your username"
                          className="focus:ring-2 focus:ring-primary-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter new password"
                          className="focus:ring-2 focus:ring-primary-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : !isResetting ? (
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your username"
                          className="focus:ring-2 focus:ring-primary-500"
                          autoComplete="username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          className="focus:ring-2 focus:ring-primary-500"
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Verify current password"
                          className="focus:ring-2 focus:ring-primary-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-200">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Create new password"
                          className="focus:ring-2 focus:ring-primary-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isForgotPassword ? (
                "Reset Password"
              ) : isResetting ? (
                "Update Credentials"
              ) : (
                "Sign In"
              )}
            </Button>

            {!isResetting && !isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="w-full text-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Forgot Password?
              </button>
            )}

            {(isResetting || isForgotPassword) && (
              <button
                type="button"
                onClick={() => {
                  setIsResetting(false);
                  setIsForgotPassword(false);
                  form.reset();
                }}
                className="w-full text-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Return to Login
              </button>
            )}
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Secure access to PeoplePulse HRMS v2.4</p>
          <p className="mt-2">
            © {new Date().getFullYear()} Your Corporation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}