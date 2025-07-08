"use client";

import { useEffect, useState } from "react";
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
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axiosInstance";
import { dropdownApi } from "@/services/api/dropdown";
import { BaselineApi, baselineFormSchema } from "@/services/api/baseline";

const EditBaseline = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Fetch baseline data first
  const { data: baselineData, isLoading: isBaselineLoading } = useQuery({
    queryKey: ["baseline", params.id],
    queryFn: async () => {
      const response = await api.get(`/ProjectBaseline/${params.id}`);
      return response.data;
    },
    enabled: !!params.id,
  });

  // Fetch dropdown data with dependencies
  const { data: logos = [], isLoading: isLogosLoading } = useQuery({
    queryKey: ["logos"],
    queryFn: dropdownApi.fetchClients,
  });

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects", baselineData?.logoID],
    queryFn: () => dropdownApi.fetchProjects(Number(baselineData?.logoID)),
    enabled: !!baselineData?.logoID,
  });

  const { data: domain = [], isLoading: isDomainLoading } = useQuery({
    queryKey: ["domain"],
    queryFn: dropdownApi.fetchDomian,
  });

  const { data: domainroles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ["domainroles", baselineData?.domainID],
    queryFn: () => dropdownApi.fetchDomianBasedRoles(Number(baselineData?.domainID)),
    enabled: !!baselineData?.domainID,
  });

  const { data: domainLevels = [], isLoading: isLevelsLoading } = useQuery({
    queryKey: ["domainLevels"],
    queryFn: dropdownApi.fetchDomianelevels,
  });

  const typeOptions = [
    { value: "HC", label: "HC" },
    { value: "3P", label: "3P" },
  ];

  // Initialize form data once all data is loaded
  useEffect(() => {
    if (
      baselineData &&
      logos.length > 0 &&
      projects.length > 0 &&
      domain.length > 0 &&
      domainroles.length > 0 &&
      domainLevels.length > 0
    ) {
      const formData = {
        logoID: baselineData.logoID?.toString() || "",
        projectID: baselineData.projectID?.toString() || "",
        type: baselineData.type || "",
        domainID: baselineData.domainID?.toString() || "",
        roleID: baselineData.roleID?.toString() || "",
        levelID: baselineData.levelID?.toString() || "",
        baseline: baselineData.baseline || 0,
        domainNameAsPerCustomer: baselineData.domainNameAsPerCustomer || "",
        notes: baselineData.notes || "",
      };

      form.reset(formData);
      setIsInitialized(true);
    }
  }, [
    isInitialized,
    baselineData,
    logos,
    projects,
    domain,
    domainroles,
    domainLevels,
    form,
    isLogosLoading,
    isProjectsLoading,
    isDomainLoading,
    isRolesLoading,
    isLevelsLoading,
  ]);

  // Handle domain change
  useEffect(() => {
    if (selectedDomain && selectedDomain !== baselineData?.domainID?.toString()) {
      form.setValue("roleID", "");
    }
  }, [selectedDomain, baselineData?.domainID, form]);

  // Handle client change
  useEffect(() => {
    if (clientId && clientId !== baselineData?.logoID?.toString()) {
      form.setValue("projectID", "");
    }
  }, [clientId, baselineData?.logoID, form]);

  const updateBaseline = useMutation({
    mutationFn: (values: z.infer<typeof baselineFormSchema>) =>
      BaselineApi.updateBaseline(values, params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baselines"] });
      router.push("/admin/manage-baseline");
    },
  });

  const onSubmit = (values: z.infer<typeof baselineFormSchema>) => {
    const payload = {
      ...values,
      id: params.id,
      isActive: baselineData?.isActive || true,
    }
    updateBaseline.mutate(payload);
  };

  const renderDropdown = (
    name: keyof z.infer<typeof baselineFormSchema>,
    label: string,
    items: Array<{ id: string | number; name: string }>,
    isLoading: boolean = false
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value?.toString() || ""}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading..." : `Select ${label}`} />
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

  if (isBaselineLoading || isLogosLoading || isDomainLoading || isLevelsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="m-16 p-4 bg-white dark:bg-[#17171A]">
      <h1 className="text-2xl mb-6">Edit Baseline</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-3/5">
          {renderDropdown("logoID", "Logo *", logos, isLogosLoading)}
          {renderDropdown("projectID", "Project *", projects, isProjectsLoading)}

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
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

          {renderDropdown("domainID", "Domain *", domain, isDomainLoading)}
          {renderDropdown("roleID", "Role *", domainroles, isRolesLoading)}
          {renderDropdown("levelID", "Level *", domainLevels, isLevelsLoading)}

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
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <Button type="submit">Save</Button>
        </form>
      </Form>
    </div>
  );
};

export default EditBaseline;