"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import api from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/userStore";
import { useState } from "react";

const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, { message: "Old password is required." }),
    newPassword: z.string().min(1, { message: "New password is required." }),
    confirmPassword: z.string().min(1, { message: "Confirm  password is required." }),
    userName: z.string().min(5, { message: "Username is required." }),
});

const changePasswordForm = () => {
    const router = useRouter();
    const { user } = useUserStore();
    const [error, setError] = useState("");

    const form = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
            userName: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
        try {

            if (values.newPassword !== values.confirmPassword) {
                setError("New password and Confirm password do not match!");
            }


            const res = await api.patch("/User/change-password", values);
            form.reset();
            router.push("/dashboard");
        } catch (error) {
            console.error("Error during change password :", error);
        }
    };

    return (
        <div className="m-16 p-16 bg-white dark:bg-[#17171A]">
            <h1 className="text-2xl mb-6">Change password</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-3/5">
                    {/* Username Field */}
                    <FormField
                        control={form.control}
                        name="userName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter username" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Old Password Field */}
                    <FormField
                        control={form.control}
                        name="oldPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Old Password *</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Enter old password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* New password Field */}
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password *</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Enter new password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Confirm password Field */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm password *</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Enter retaining info (if any)" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    {/* Submit Button */}
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    );
};

export default changePasswordForm;
