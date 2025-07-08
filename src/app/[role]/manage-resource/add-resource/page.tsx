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
import { useRouter } from "next/navigation";
import { resourceFormSchema } from "@/services/api/resource";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ResourceApi } from "@/services/api/resource";
import { dropdownApi } from "@/services/api/dropdown";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserStore } from "@/store/userStore";

const extendedFormSchema = resourceFormSchema.extend({
  setApplicationAccess: z.boolean().default(false),
  userName: z.string().optional(),
  email: z.string().optional(),
});

const AddResource = () => {
  const [showAppAccess, setShowAppAccess] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(extendedFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      emailID: "",
      mobileNumber: "",
      clientID: 0,
      projectID: 0,
      pmid: 0,
      rmid: 0,
      supplierID: user?.supplierID || 0,
      setApplicationAccess: false,
      userName: "",
    },
  });


  const selectedPM = form.watch("pmid");
  const clientId = form.watch("clientID");
  // Fetch Clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: dropdownApi.fetchClients,
  });

  // Fetch Projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", clientId],
    queryFn: () => dropdownApi.fetchProjects(Number(clientId)),
    enabled: !!clientId,
  });

  const createResource = useMutation({
    mutationFn: ResourceApi.createResource,
    onSuccess: () => {
      form.reset();
      router.push("/admin/manage-resource");
    },
  });

  const onSubmit = async (values: z.infer<typeof extendedFormSchema>) => {
    const [password] = values.emailID.split("@");
    const payload = { ...values, isActive: true, password: password };
    createResource.mutate(payload);
  };

  const { data: projectManagers = [] } = useQuery({
    queryKey: ["projectManagers"],
    queryFn: dropdownApi.fetchProjectManager,
  });

  const { data: relationshipManagers = [] } = useQuery({
    queryKey: ["relationshipManagers", selectedPM],
    queryFn: () => dropdownApi.fetchRMBasedPm(selectedPM),
    enabled: !!selectedPM,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: dropdownApi.fetchSuppliers,
    enabled: !!user?.roleId,

  });

  useEffect(() => {
    if (Number(user?.roleId) === 6 && user?.roleId && suppliers.length > 0) {
      form.setValue('supplierID', Number(user?.supplierID));
    }
  }, [user, suppliers, form]);

  const renderDropdown = (
    name: keyof z.infer<typeof resourceFormSchema>,
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
      <h1 className="text-2xl mb-6">Add Resource</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-3/5"
        >
          {/* First Name Field */}
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

          {/* Last Name Field */}
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
            name="emailID"
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
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Account Name */}
          <FormField
            control={form.control}
            name="clientID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name (Logo) *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account name" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Project */}
          <FormField
            control={form.control}
            name="projectID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {renderDropdown("pmid", "Project Manager *", projectManagers)}
          {renderDropdown("rmid", "Relationship Manager", relationshipManagers)}
          {/* Supplier Dropdown */}
          <FormField
            control={form.control}
            name="supplierID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString() || ""}
                  disabled={Number(user?.roleId) === 6} // Disable based on role
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={supplier.id.toString()}
                      >
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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

export default AddResource;
