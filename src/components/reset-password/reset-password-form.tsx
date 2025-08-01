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
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import api from "@/lib/axiosInstance";
import { toast } from "sonner";
import Link from "next/link";

const resetPasswordSchema = z.object({
    username: z.string().min(1, "Username is required"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Must contain uppercase, number, and special character"
        ),
});

export default function ResetPasswordForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            username: "",
            newPassword: ""
        },
        mode: "onBlur",
    });

    useEffect(() => {
        const usernameFromUrl = searchParams.get('username');
        if (usernameFromUrl) {
            form.setValue('username', usernameFromUrl);
        }
    }, [searchParams, form]);

    const handlePasswordReset = async (data: z.infer<typeof resetPasswordSchema>) => {
        setIsSubmitting(true);

        try {
            await api.patch("/User/change-password", {
                username: data.username,
                newPassword: data.newPassword,
                forgotPassword: true,
            });

            toast.success("Password reset successful. Please login with your new password.");
            router.push("/login");
        } catch (error: any) {
            console.error("Password reset error:", error);
            const errorMessage = error.response?.data?.message ||
                "Failed to reset password. Please try again.";

            toast.error(errorMessage);
            form.reset({
                username: "",
                newPassword: ""
            });
        } finally {
            setIsSubmitting(false);
        }
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
                    Reset Password
                </h1>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handlePasswordReset)}
                        className="space-y-6"
                    >
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

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Reset Password"
                            )}
                        </Button>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                            >
                                Return to Login
                            </Link>
                        </div>
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