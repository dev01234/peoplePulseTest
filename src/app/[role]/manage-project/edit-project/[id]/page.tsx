'use client';
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
import { ProjectApi, projectFormSchema } from "@/services/api/projects";
import { useMutation, useQuery } from "@tanstack/react-query";
import { dropdownApi } from "@/services/api/dropdown";
import { useEffect } from "react";
import Loader from "@/components/ui/loader";

const EditProject = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // Initialize the form with default values from your project schema
  const form = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      isActive: true,
      name: "",
      projectCode: "",
      startDate: new Date(),
      endDate: new Date(),
      clientID: 0,
      pmid: 0,
      rmid: 0,
      deliveryMotionID: 0,
      segmentID: 0,
      supportTypeID: 0,
    },
  });

  const { reset } = form;

  // Fetch dropdown data
  const { data: deliveryMotions = [] } = useQuery({
    queryKey: ["deliveryMotions"],
    queryFn: dropdownApi.fetchDeliveryMotions,
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["segments"],
    queryFn: dropdownApi.fetchSegments,
  });

  const { data: supportTypes = [] } = useQuery({
    queryKey: ["supportTypes"],
    queryFn: dropdownApi.fetchSupportTypes,
  });

  const { data: projectManagers = [] } = useQuery({
    queryKey: ["projectManagers"],
    queryFn: dropdownApi.fetchProjectManager,
  });

  // Watch the selected Project Manager (pmid)
  const selectedPm = form.watch("pmid");

  // Fetch Relationship Managers based on selectedPm
  const { data: relationshipManagers = [] } = useQuery({
    queryKey: ["relationshipManagers", selectedPm],
    queryFn: () => dropdownApi.fetchRMBasedPm(selectedPm),
    enabled: !!selectedPm,
  });

  // When the list of relationship managers updates, check whether the current rmid is still valid.
  useEffect(() => {
    if (relationshipManagers && relationshipManagers.length > 0) {
      const currentRmid = form.getValues("rmid");
      // If the current relationship manager is not found, update to the first available one
      if (!relationshipManagers.some((rm: any) => rm.id === currentRmid)) {
        form.setValue("rmid", relationshipManagers[0].id);
      }
    }
  }, [relationshipManagers, form]);

  // Remove any unconditional reset of rmid on pmid change (the above effect handles it).
  // If you prefer to reset when there are no relationship managers, you can add:
  useEffect(() => {
    if (selectedPm && relationshipManagers && relationshipManagers.length === 0) {
      form.setValue("rmid", 0);
    }
  }, [selectedPm, relationshipManagers, form]);

  // Fetch project data and reset the form
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", params.id],
    queryFn: async () => {
      const response = await api.get(`/Project/${params.id}`);
      const userData = response.data;
      reset({
        name: userData?.name || "",
        startDate: userData?.startDate ? new Date(userData.startDate) : new Date(),
        endDate: userData?.endDate ? new Date(userData.endDate) : new Date(),
        projectCode: userData?.projectCode,
        pmid: userData?.pmid,
        rmid: userData?.rmid,
        deliveryMotionID: userData?.deliveryMotionID,
        supportTypeID: userData?.supportTypeID,
        segmentID: userData?.segmentID,
        clientID: userData?.clientID,
        isActive: userData?.isActive,
      });
      return userData;
    },
    enabled: !!params.id,
  });

  // Mutation to update the project
  const updateProject = useMutation({
    mutationFn: (values: z.infer<typeof projectFormSchema>) =>
      ProjectApi.updateProject(values, params.id),
    onSuccess: () => {
      form.reset();
      router.push("/admin/manage-project");
    },
  });

  const onSubmit = async (values: z.infer<typeof projectFormSchema>) => {
    const updatedProject = {
      ...(project || {}),
      name: values.name,
      startDate: values.startDate,
      endDate: values.endDate,
      projectCode: values.projectCode,
      pmid: values.pmid,
      rmid: values.rmid,
      deliveryMotionID: values.deliveryMotionID,
      supportTypeID: values.supportTypeID,
      segmentID: values.segmentID,
      clientID: values.clientID,
      isActive: values.isActive,
    };
    updateProject.mutate(updatedProject);
  };

  if (isProjectLoading) {
    return <Loader/>;
  }

  // Utility function to render a dropdown field.
  const renderDropdown = (
    name: keyof z.infer<typeof projectFormSchema>,
    label: string,
    items: Array<{ id: number; name: string }>,
    disabled?: boolean
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(Number(value) || null)}
            value={field.value ? field.value.toString() : ""}
            disabled={disabled}
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
      <h1 className="text-2xl mb-6">Edit Project</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-3/5">
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

          {/* Project Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Project Code */}
          <FormField
            control={form.control}
            name="projectCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start Date */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dropdowns */}
          {renderDropdown("pmid", "Project Manager", projectManagers)}
          {renderDropdown("rmid", "Relationship Manager", relationshipManagers, !selectedPm)}
          {renderDropdown("deliveryMotionID", "Delivery Motion", deliveryMotions)}
          {renderDropdown("segmentID", "Segment", segments)}
          {renderDropdown("supportTypeID", "Support Type", supportTypes)}

          <Button type="submit">Save</Button>
        </form>
      </Form>
    </div>
  );
};

export default EditProject;
