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
import api from "@/lib/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import { ResourceApi, resourceFormSchema } from "@/services/api/resource";
import { ClientRow, ClientApi } from "@/services/api/client";
import {
  ProjectType,
  ProjectApi,
  projectFormSchema,
} from "@/services/api/projects";
import { useMutation, useQuery } from "@tanstack/react-query";
import { dropdownApi } from "@/services/api/dropdown";
import { useEffect } from "react";
import Loader from "@/components/ui/loader";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { useUserStore } from "@/store/userStore";

const extendedFormSchema = resourceFormSchema.extend({
  setApplicationAccess: z.boolean().default(false),
  userName: z.string().optional(),
});

const EditResource = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUserStore();
  const form = useForm<z.infer<typeof extendedFormSchema>>({
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
      supplierID: 0,
      setApplicationAccess: false,
      userName: "",
    },
  });

  const { reset, setValue, watch } = form;
  const selectedPm = watch("pmid");
  const selectedClientID = watch("clientID");
  const showAppAccess = watch("setApplicationAccess"); // Watch checkbox state

  // Fetch Clients
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: dropdownApi.fetchClients,
  });

  // Fetch Projects
  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects", selectedClientID],
    queryFn: () => dropdownApi.fetchProjects(Number(selectedClientID)),
    enabled: !!selectedClientID,
  });

  // Fetch Project Managers
  const { data: projectManagers = [] } = useQuery({
    queryKey: ["projectManagers"],
    queryFn: dropdownApi.fetchProjectManager,
  });

  // Fetch Relationship Managers
  const { data: relationshipManagers = [] } = useQuery({
    queryKey: ["relationshipManagers", selectedPm],
    queryFn: () => dropdownApi.fetchRMBasedPm(selectedPm),
    enabled: !!selectedPm,
  });

  // Fetch Suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: dropdownApi.fetchSuppliers,
  });

  // Fetch Resource Data
  const { data: resource, isLoading: isResourceLoading } = useQuery({
    queryKey: ["resource", params.id],
    queryFn: async () => {
      const response = await api.get(`/Resource/${params.id}`);
      reset({
        ...response.data,
        setApplicationAccess: response.data.setApplicationAccess || false,
        userName: response.data.userName || "",
      });
      return response.data;
    },
    enabled: !!params.id,
  });

  // Update Project and RM when dependencies change
  useEffect(() => {
    if (
      projects?.length > 0 &&
      !projects.some((p) => p.id === form.getValues("projectID"))
    ) {
      form.setValue("projectID", projects[0]?.id || 0);
    }
  }, [projects, form]);

  useEffect(() => {
    if (
      relationshipManagers?.length > 0 &&
      !relationshipManagers.some((rm) => rm.id === form.getValues("rmid"))
    ) {
      form.setValue("rmid", relationshipManagers[0]?.id || 0);
    }
  }, [relationshipManagers, form]);

  // Mutation for updating resource
  const updateResource = useMutation({
    mutationFn: (values: z.infer<typeof extendedFormSchema>) =>
      ResourceApi.updateResource(values, params.id),
    onSuccess: () => {
      router.push("/admin/manage-resource");
    },
  });

  const onSubmit = async (values: z.infer<typeof extendedFormSchema>) => {
    const [password] = values.emailID.split("@");
    const payload = { ...values, isActive: true, password: password, id: resource.id };
    updateResource.mutate(payload);
  };

  if (isResourceLoading || isClientsLoading || isProjectsLoading) {
    return <Loader />;
  }

  // Render dropdown helper
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
            onValueChange={(value) => field.onChange(Number(value))}
            value={field.value?.toString() || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
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
      <h1 className="text-2xl mb-6">Edit Resource</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-3/5"
        >
          {/* Existing form fields */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Client Dropdown */}
          {renderDropdown("clientID", "Account Name *", clients)}

          {/* Project Dropdown */}
          <FormField
            control={form.control}
            name="projectID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString() || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: ProjectType) => (
                      <SelectItem
                        key={project.id}
                        value={project.id.toString()}
                      >
                        {project.name}
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
            name="pmid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Manager *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString() || ""}
                  disabled={Number(user?.roleId) === 3} // Disable for PM role
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project manager" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectManagers.map((pm) => (
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

          {/* Relationship Manager Dropdown - Disabled for roleID 4 */}
          <FormField
            control={form.control}
            name="rmid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship Manager</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString() || ""}
                  disabled={Number(user?.roleId) === 4} // Disable for RM role
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship manager" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {relationshipManagers.map((rm) => (
                      <SelectItem key={rm.id} value={rm.id.toString()}>
                        {rm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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

          {/* Application Access Section */}
          <FormField
            control={form.control}
            name="setApplicationAccess"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Grant application access</FormLabel>
              </FormItem>
            )}
          />

          {showAppAccess && (
            <div className="pl-7 space-y-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </div>
  );
};

export default EditResource;
