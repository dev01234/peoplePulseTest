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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import api from "@/lib/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import { userFormSchema, UsersApi } from "@/services/api/users";
import { useMutation, useQuery } from "@tanstack/react-query";
import { dropdownApi } from "@/services/api/dropdown";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const roleMap: Record<string, number> = {
  admin: 1,
  pm: 2,
  user: 3,
  supplier: 4,
};

const extendedFormSchema = userFormSchema.extend({
  setApplicationAccess: z.boolean().default(false),
  userName: z.string().optional(),
});

const EditUser = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [showAppAccess, setShowAppAccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(extendedFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      contactNumber: "",
      accessTypeID: 0,
      isActive: false,
      pmid: undefined,
      setApplicationAccess: false
    },
  });
  const { reset } = form;
  const accessType = form.watch("accessTypeID");

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", params.id],
    queryFn: async () => {
      const response = await api.get(`/User/${params.id}`);
      const userData = response.data;
      console.log(userData)
      reset({
        firstName: userData?.firstName || "",
        lastName: userData?.lastName || "",
        email: userData?.email || "",
        contactNumber: userData?.contactNumber || "",
        accessTypeID: userData?.accessTypeID || 0,
        isActive: userData?.isActive || false,
        pmid: userData?.pmid || 0,
        setApplicationAccess: userData?.setApplicationAccess || false,
        userName: userData?.userName || "",
      });
      setShowAppAccess(userData?.setApplicationAccess);
      return response.data;
    },
    enabled: !!params.id,
  });

  // Fetch project managers (users with accessTypeID = 3)
  const { data: productManagers = [] } = useQuery({
    queryKey: ["productManagers"],
    queryFn: async () => {
      const response = await api.get("/master/pmlist");
      return response.data || [];
    },
    enabled: accessType === 4, // Only fetch when ReportingManager is selected
  });

  //fetching accesstypes
  const { data: accestypes = [] } = useQuery({
    queryKey: ["accesstypes"],
    queryFn: dropdownApi.fetchAccessTypes,
  });

  const updateUser = useMutation({
    mutationFn: (values: z.infer<typeof extendedFormSchema>) =>
      UsersApi.updateUser(values, params.id),
    onSuccess: (data) => {
      if (!data.data.error) {
        form.reset();
        router.push("/admin/manage-user");
        return;
      }
      toast.error(data.data.error)
    }
  });

  const onSubmit = async (values: z.infer<typeof extendedFormSchema>) => {
    const updatedUser = {
      ...(user || {}),
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      contactNumber: values.contactNumber,
      accessTypeID: values.accessTypeID,
      isActive: values.isActive,
      setApplicationAccess: values.setApplicationAccess,
      pmid: values.pmid || user.pmid,
      username: values.setApplicationAccess ? values.userName : "",
      ...(values.accessTypeID === 4 && { pmid: values.pmid }),
    };
    updateUser.mutate(updatedUser);
  };

  if (isUserLoading) {
    return <Loader />
  }

  return (
    <div className="m-16 p-4 bg-white dark:bg-[#17171A]">
      <h1 className="text-2xl mb-6">Edit User</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-3/5">
          {/* Role Field */}
          <FormField
            control={form.control}
            name="accessTypeID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(Number(value));
                  }}
                  value={field.value ? field.value.toString() : ""}
                  disabled={true}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accestypes.map((accessType: any) => (
                      <SelectItem
                        key={accessType.id}
                        value={accessType.id.toString()}
                      >
                        {accessType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* First Name Field */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{accessType == 6 ? "Name *" : "First Name *"}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={accessType == 6 ? "Enter name *" : "Enter first name *"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name Field */}
          {accessType != 6 && (
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
          )}

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
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
                  <Input placeholder="Enter contact number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status Field */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={
                    typeof field.value === "boolean" ? field.value.toString() : ""
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
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

          {/* project manager Selection - Only show when ReportingManager is selected */}
          {accessType === 4 && (
            <FormField
              control={form.control}
              name="pmid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Manager *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Project Manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productManagers.map((pm: any) => (
                        <SelectItem key={pm.id} value={pm.id.toString()}>
                          {pm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Application Access Checkbox */}
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
                  Grant application access
                </FormLabel>
              </FormItem>
            )}
          />

          {/* Conditionally displayed username field */}
          {showAppAccess && (
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
          )}

          {/* Submit Button */}
          <Button type="submit">Save</Button>
        </form>
      </Form>
    </div>
  );
};

export default EditUser;