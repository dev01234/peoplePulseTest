"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axiosInstance";
import { ProjectApi, projectFormSchema, ProjectType } from "@/services/api/projects";
import { useMutation, useQuery } from "@tanstack/react-query";
import { dropdownApi } from "@/services/api/dropdown";
import { ClientApi, ClientRow } from "@/services/api/client";
import { RManagerApi, rmFormSchema } from "@/services/api/rmanager";
import Loader from "@/components/ui/loader";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const extendedFormSchema = rmFormSchema.extend({
    setApplicationAccess: z.boolean().default(false),
    userName: z.string().optional(),
});


const EditRelationshipManager = () => {
    const [showAppAccess, setShowAppAccess] = useState(false);
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(extendedFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            contactNumber: "",
            projectManagerID: 0,
            clientID: 0,
            projectID: 0,
            isActive: false,
            setApplicationAccess: false,
            userName: "",
        },
    });

    const { data: clients = [] } = useQuery<ClientRow[]>({
        queryKey: ["clients"],
        queryFn: ClientApi.fetchClients,
    });

    const { data: projects = [] } = useQuery<ProjectType[]>({
        queryKey: ["projects"],
        queryFn: ProjectApi.fetchProjects,
    });

    const { data: projectManagers = [] } = useQuery({
        queryKey: ["projectManagers"],
        queryFn: dropdownApi.fetchProjectManager
    });

    const { reset } = form;

    const { data: project, isLoading: isRMLoading } = useQuery({
        queryKey: ["rm", params.id],
        queryFn: async () => {
            const response = await api.get(`/RM/${params.id}`);
            const userData = response.data
            reset({
                firstName: userData?.firstName || "",
                lastName: userData?.lastName || "",
                contactNumber: userData?.contactNumber,
                email: userData?.email,
                clientID: userData?.clientID,
                projectID: userData?.projectID,
                projectManagerID: userData?.projectManagerID,
                isActive: userData?.isActive,
                setApplicationAccess: userData?.setApplicationAccess,
                userName: userData?.userName,
            });
            return response.data;
        },
        enabled: !!params.id, // only run if params.id is defined
    });

    const updateProject = useMutation({
        mutationFn: (values: z.infer<typeof projectFormSchema>) =>
            RManagerApi.updateRManager(values, params.id),
        onSuccess: () => {
            form.reset();
            router.push("/admin/manage-rms");
        },
    });

    const onSubmit = async (values: z.infer<typeof extendedFormSchema>) => {
        const updatedProject = {
            ...(project || {}), // Fallback to an empty object if user is undefined
            firstName: values?.firstName || "",
            lastName: values?.lastName || "",
            contactNumber: values?.contactNumber,
            email: values?.email,
            projectManagerID: values?.projectManagerID,
            isActive: values?.isActive,
            setApplicationAccess: values?.setApplicationAccess,
            userName: values?.userName,
        };
        updateProject.mutate(updatedProject);
    };

    if (isRMLoading) {
        return <Loader />
    }

    const renderDropdown = (
        name: keyof z.infer<typeof extendedFormSchema>,
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
                        onValueChange={(value) => field.onChange(Number(value) || null)}  // Handle `null` if needed
                        value={field.value ? field.value.toString() : ""} // Handle null/undefined gracefully
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
            <h1 className="text-2xl mb-6">Edit Relationship Manager</h1>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 w-3/5"
                >
                    {/* Active Status */}
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Status</FormLabel>
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

                    <Button type="submit">Save</Button>
                </form>
            </Form>
        </div>
    );
};

export default EditRelationshipManager;
