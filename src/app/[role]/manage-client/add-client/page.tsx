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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientApi, clientFormSchema } from "@/services/api/client";
import { dropdownApi } from "@/services/api/dropdown";
import { toast } from "sonner";


const AddClient = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      id: 0,
      isActive: true,
      name: "",
      clientCode: "C000EH123",
      shortName: "",
      startDate: new Date(),
      endDate: new Date(),
      address: "",
      notes: "",
      regionID: 0,
      stateID: 0,
      locationID: 0, // or an appropriate default
      pincode: "",
      spocid: 1,
      spoc: {
        id: 1,
        isActive: true,
        name: "",
        contactNumber: "",
        email: "",
      },
    },
  });

  const selectedStateId = form.watch("stateID");


  // Fetch dropdown data using React Query
  const { data: regions = [] } = useQuery({
    queryKey:["regions"], 
    queryFn: dropdownApi.fetchRegions
  });

  const { data: states = [] } = useQuery({
    queryKey:["states"], 
    queryFn:dropdownApi.fetchStates
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations",selectedStateId],
    queryFn: () => dropdownApi.fetchLocations(Number(selectedStateId)), // Should return an array like [{ id: "1", name: "Project 1" }, ...]
    enabled: !!selectedStateId,
  });


  // Mutation to create a client
  const createClient = useMutation({
    mutationFn: ClientApi.createClient,
    onSuccess: (data) => {
      if(!data.data.error){
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      form.reset();
      router.push("/admin/manage-client");
      return;
    }
    toast.error(data.data.error)
    },
  });

  const onSubmit = (values: z.infer<typeof clientFormSchema>) => {
    // Create payload matching the required format
    const payload = {
      id: 0, // or generate as needed
      isActive: values.isActive,
      name: values.name,
      shortName: values.shortName,
      startDate: values.startDate,
      endDate: values.endDate,
      address: values.address,
      notes: values.notes,
      regionID: values.regionID,
      stateID: values.stateID,
      locationID: values.locationID,
      pincode: values.pincode, // ensure it's a number
      spocid: 0, // assign as required
      spoc: {
        id: 0, // adjust as necessary
        isActive: true, // or take from form if needed
        name: values.spoc.name,
        contactNumber: values.spoc.contactNumber,
        email: values.spoc.email,
      },
    };
  
    createClient.mutate(payload);
  };
  // Helper to render a dropdown field
  const renderDropdown = (
    name: keyof z.infer<typeof clientFormSchema>,
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
            value={field.value ? field.value.toString() : ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${label}`} />
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
      <h1 className="text-2xl mb-6">Add Entity</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-3/5"
        >
          {/* Logo Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter logo name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Short Name */}
          <FormField
            control={form.control}
            name="shortName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter short name" {...field} />
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
                <FormLabel>Start Date *</FormLabel>
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
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
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
                <FormLabel>End Date *</FormLabel>
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
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
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

          {/* Region Dropdown */}
          {renderDropdown("regionID", "Region *", regions)}

          {/* State Dropdown */}
          {renderDropdown("stateID", "State *", states)}

          {renderDropdown("locationID", "Location *", locations)}


          {/* Pincode  */}
          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter Picode" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SPOC Name */}
          <FormField
            control={form.control}
            name="spoc.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SPOC Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter SPOC name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SPOC Contact Number */}
          <FormField
            control={form.control}
            name="spoc.contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SPOC Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter SPOC contact number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SPOC Email */}
          <FormField
            control={form.control}
            name="spoc.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SPOC Email ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter SPOC email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
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

          {/* Status Dropdown */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "true")
                  }
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default AddClient;
