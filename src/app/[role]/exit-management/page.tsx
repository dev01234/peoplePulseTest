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

const formSchema = z.object({
    resignationDate: z.string().min(1, { message: "Resignation Date is required." }),
    relievingDate: z.string().min(1, { message: "Relieving Date is required." }),
    reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
    retainingInfo: z.string().optional(),
});

const exitForm = () => {
    const router = useRouter();
    const { user } = useUserStore();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userID: user.id,
            resignationDate: "",
            relievingDate: "",
            reason: "",
            retainingInfo: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const res = await api.post("/ExitManagement/submit-exit-request", values);
            console.log("Resignation submitted:", res.data);
            form.reset();
            router.push("/dashboard");
        } catch (error) {
            console.error("Error submitting resignation:", error);
        }
    };

    return (
        <div className="m-16 p-16 bg-white dark:bg-[#17171A]">
            <h1 className="text-2xl mb-6">Submit Resignation</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-3/5">
                    {/* Resignation Date Field */}
                    <FormField
                        control={form.control}
                        name="resignationDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Resignation Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Relieving Date Field */}
                    <FormField
                        control={form.control}
                        name="relievingDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Relieving Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Reason for Resignation Field */}
                    <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reason for Resignation</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter reason" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Retaining Info Field */}
                    <FormField
                        control={form.control}
                        name="retainingInfo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Remarks</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter retaining info (if any)" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Submit Button */}
                    <Button type="submit">Submit Resignation</Button>
                </form>
            </Form>
        </div>
    );
};

export default exitForm;
