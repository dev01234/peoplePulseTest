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
import Link from "next/link";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Please enter a valid email address"),
});

export default function Login() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { update } = useUserStore();

  const form = useForm({
    resolver: zodResolver(
      isForgotPassword ? forgotPasswordSchema : loginSchema
    ),
    defaultValues: {
      username: "",
      password: "",
      email: ""
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset();
  }, [isForgotPassword, form]);

  const handleAuthSubmission = async (
    data: z.infer<typeof loginSchema> | z.infer<typeof forgotPasswordSchema>
  ) => {
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        await handleForgotPassword(data as z.infer<typeof forgotPasswordSchema>);
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

  const handleForgotPassword = async (data: z.infer<typeof forgotPasswordSchema>) => {
    const response = await api.post(`/user/reset-password-confirmation?username=${data.email}`);

    toast.success("Password reset instructions have been sent to your email.");
    setIsForgotPassword(false);
  };

  const handleAuthError = (error: any) => {
    console.error("Authentication error:", error);
    const errorMessage = error.response?.data?.message ||
      "Invalid credentials. Please try again.";

    toast.error(errorMessage);
    form.reset({
      username: "",
      password: "",
      email: ""
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
          {isForgotPassword ? "Forgot Password" : "Employee Authentication Portal"}
        </h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAuthSubmission)}
            className="space-y-6"
          >
            {isForgotPassword ? (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">
                      Email Address or Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}

                        placeholder="Enter your email address or username"
                        className="focus:ring-2 focus:ring-primary-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
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
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isForgotPassword ? (
                "Send Reset Instructions"
              ) : (
                "Sign In"
              )}
            </Button>

            {!isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="w-full text-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Forgot Password?
              </button>
            )}

            {isForgotPassword && (
              <button
                type="button"
                onClick={() => {
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