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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { dropdownApi } from "@/services/api/dropdown";
// Import the updated schema
import { BaselineApi, baselineFormSchema } from "@/services/api/baseline";
import { ClientApi } from "@/services/api/client";
import { ProjectApi } from "@/services/api/projects";
import { useEffect, useState } from 'react';
import { toast } from "sonner";

const AddBaseline = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize react-hook-form with the new schema and default values.
  const form = useForm<z.infer<typeof baselineFormSchema>>({
    resolver: zodResolver(baselineFormSchema),
    defaultValues: {
      logoID: "",
      projectID: "",
      type: "",
      domainID: "",
      roleID: "",
      levelID: "",
      baseline: 0,
      domainNameAsPerCustomer: "",
      notes: "",
    },
  });

  const selectedDomain = form.watch("domainID");
  const clientId = form.watch("logoID");
  const selectedProjectId = form.watch("projectID"); // Add project ID watcher
  // Verify baseline when project changes
  useEffect(() => {
    const verifyProjectBaseline = async () => {
      if (selectedProjectId) {
        try {
          const response = await BaselineApi.verifyBaseline(Number(selectedProjectId));
          if (response.data) {
            toast.error(response.data)
          }
        } catch (error) {
          toast.error("Baseline verification failed", {
            description: error.message || "This project cannot be used for baseline creation.",
          });
        }
      }
    };

    verifyProjectBaseline();
  }, [selectedProjectId]);

  useEffect(() => {
    form.setValue("roleID", "");
  }, [selectedDomain, form]);

  // Fetch dropdown data (update these API calls to your endpoints)
  const { data: logos = [] } = useQuery({
    queryKey: ["logos"],
    queryFn: dropdownApi.fetchClients, // Should return an array like [{ id: "1", name: "Logo 1" }, ...]
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects", clientId],
    queryFn: () => dropdownApi.fetchProjects(Number(clientId)), // Should return an array like [{ id: "1", name: "Project 1" }, ...]
    enabled: !!clientId,
  });

  // For Domain, Role & Level, we assume they come from the same endpoint
  const { data: domain = [] } = useQuery({
    queryKey: ["domain"],
    queryFn: dropdownApi.fetchDomian, // Returns array like [{ id: "1", name: "Option 1" }, ...]
  });

  const { data: domainroles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ["domainRoles", selectedDomain],
    queryFn: () => dropdownApi.fetchDomianBasedRoles(Number(selectedDomain)),
    enabled: !!selectedDomain,
  });

  const { data: domainLevels = [] } = useQuery({
    queryKey: ["domainLevels"],
    queryFn: dropdownApi.fetchDomianelevels, // Returns array like [{ id: "1", name: "Option 1" }, ...]
  });

  // Static options for the Type field.
  const typeOptions = [
    { value: "HC", label: "HC" },
    { value: "3P", label: "3P" },
  ];

  // Mutation to create a new baseline entry.
  const createBaseline = useMutation({
    mutationFn: BaselineApi.createBaseline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baselines"] });
      form.reset();
      router.push("/admin/manage-baseline");
    },
    onError: (error) => {
      toast("Error creating baseline:", { description: error.message });
    }
  });

  const onSubmit = (values: z.infer<typeof baselineFormSchema>) => {
    const payload = {
      ...values,
      isActive: true,
    };
    createBaseline.mutate(payload);
  };

  // Helper to render dropdown fields for string-based values.
  const renderDropdown = (
    name: keyof z.infer<typeof baselineFormSchema>,
    label: string,
    items: Array<{ id: string; name: string }>
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value)}
            value={field.value ? field.value.toString() : ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${label}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isRolesLoading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : (
                items.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="m-16 p-4 bg-white dark:bg-[#17171A]">
      <h1 className="text-2xl mb-6">Add Baseline</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-3/5"
        >
          {/* Logo Dropdown */}
          {renderDropdown("logoID", "Logo *", logos)}

          {/* Project Dropdown */}
          {renderDropdown("projectID", "Project *", projects)}

          {/* Type Dropdown (static options) */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Domain Dropdown */}
          {renderDropdown("domainID", "Domain *", domain)}

          {/* Role Dropdown */}
          {renderDropdown("roleID", "Role *", domainroles)}

          {/* Level Dropdown */}
          {renderDropdown("levelID", "Level *", domainLevels)}

          {/* Baseline Number Input */}
          <FormField
            control={form.control}
            name="baseline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Baseline *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter baseline"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Domain Name as per Customer Input */}
          <FormField
            control={form.control}
            name="domainNameAsPerCustomer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain Name as per Customer *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter domain name as per customer"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes Text Input (optional) */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input placeholder="Enter notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddBaseline;
