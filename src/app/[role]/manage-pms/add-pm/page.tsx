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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { ProjectApi, projectFormSchema, ProjectType } from "@/services/api/projects";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ClientApi, ClientRow } from "@/services/api/client";
import { dropdownApi } from "@/services/api/dropdown";
import { PManagerApi, pmanagerFormSchema } from "@/services/api/pmanager";



const AddPM = () => {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: managerTypes = [] } = useQuery({
        queryKey: ["managerTypes"],
        queryFn: dropdownApi.fetchManagerTypes
    });


    const form = useForm<z.infer<typeof pmanagerFormSchema>>({
        resolver: zodResolver(pmanagerFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            contactNumber: "",
            managerTypeID: 0,
            isActive: false,
        },
    });

    const createPManager = useMutation({
        mutationFn: PManagerApi.createPManager,
        onSuccess: () => {
            form.reset();
            router.push("/admin/manage-pms");
        },
    });

    const onSubmit = async (values: z.infer<typeof pmanagerFormSchema>) => {
        const payload = {
            ...values,
            firstName: values?.firstName || "",
            lastName: values?.lastName || "",
            contactNumber: values?.contactNumber,
            email: values?.email,
            managerTypeID: values?.managerTypeID,
            isActive: values?.isActive,
        };
        createPManager.mutate(payload);
    };

    const renderDropdown = (
        name: keyof z.infer<typeof pmanagerFormSchema>,
        label: string,
        items: Array<{ id: number; name: string }>
    ) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value.toString()}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {items.map((item) => (
                                <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    return (
        <div className="m-16 p-4 bg-white dark:bg-[#17171A]">
            <h1 className="text-2xl mb-6">Add Project Manager</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-3/5">
                    {/* Active Status */}
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === "true")}
                                    value={field.value.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select PM status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* First Name */}
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter first name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Last Name */}
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter last name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email Field */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Phone Field */}
                    <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {renderDropdown("managerTypeID", "Manager Type *", managerTypes)}
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    );
};

export default AddPM;