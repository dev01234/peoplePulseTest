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
import { pmanagerFormSchema } from "@/services/api/pmanager";
import { RManagerApi, rmFormSchema } from "@/services/api/rmanager";
import { Checkbox } from "@/components/ui/checkbox";

const extendedFormSchema = rmFormSchema.extend({
    setApplicationAccess: z.boolean().default(false),
    userName: z.string().optional(),
});

const AddRelationshipManager = () => {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showAppAccess, setShowAppAccess] = useState(false);


    const { data: projectManagers = [] } = useQuery({
        queryKey: ["projectManagers"],
        queryFn: dropdownApi.fetchProjectManager
    });

    const form = useForm<z.infer<typeof extendedFormSchema>>({
        resolver: zodResolver(extendedFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            contactNumber: "",
            projectManagerID: 0,
            isActive: true,
            setApplicationAccess: false,
            userName: "",
        },
    });

    const createRM = useMutation({
        mutationFn: RManagerApi.createRManager,
        onSuccess: () => {
            form.reset();
            router.push("/admin/manage-rms");
        },
    });

    const onSubmit = async (values: z.infer<typeof extendedFormSchema>) => {
        const payload = {
            ...values,
            firstName: values?.firstName || "",
            lastName: values?.lastName || "",
            contactNumber: values?.contactNumber,
            email: values?.email,
            projectManagerID: values?.projectManagerID,
            isActive: values?.isActive,
            setApplicationAccess: values?.setApplicationAccess,
            userName: values?.userName,
        };
        createRM.mutate(payload);
    };

    const renderDropdown = (
        name: keyof z.infer<typeof rmFormSchema>,
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
                                            <SelectValue placeholder="Select project status" />
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
                    {renderDropdown("projectManagerID", "Project Manager *", projectManagers)}

                    <FormField
                        control={form.control}
                        name="setApplicationAccess"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                            setShowAppAccess(checked as boolean);
                                        }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    Grant application access to this supplier
                                </FormLabel>
                            </FormItem>
                        )}
                    />

                    {showAppAccess && (
                        <div className="space-y-4 pl-7">
                            <FormField
                                control={form.control}
                                name="userName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Username" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}


                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    );
};

export default AddRelationshipManager;