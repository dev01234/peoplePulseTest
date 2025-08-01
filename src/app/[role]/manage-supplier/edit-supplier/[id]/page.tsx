'use client';
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axiosInstance";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// UI Components
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
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery } from "@tanstack/react-query";
import { dropdownApi } from "@/services/api/dropdown";
import { SupplierApi } from "@/services/api/supplier";
import Loader from "@/components/ui/loader";

// Define your supplier form schema
const formSchema = z.object({
  id: z.number().default(0),
  name: z.string().min(1, "Supplier name is required"),
  supplier_Code: z.string().min(1, "Supplier code is required"),
  sidDate: z.string().min(1, "Supplier code is required"),
  address: z.string().min(1, "Address is required"),
  stateID: z.number().min(1, "State is required"),
  contactNumber: z.string().min(10, { message: "Contact number is required." }),
  gst: z.string().regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/,
    "Invalid GST number"
  ),
  pan: z.string().regex(
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    "Invalid PAN number"
  ),
  tan: z.string().regex(
    /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/,
    "Invalid TAN number"
  ),
  setApplicationAccess: z.boolean().default(false),
  userName: z.string().optional(),
  email: z.string().email().optional(),
  contactInformation: z.array(
    z.object({
      id: z.number().default(0),
      isActive: z.boolean().default(true),
      contactTypeID: z
        .number({ required_error: "Contact type is required" })
        .min(1, "Select a valid contact type"),
      name: z.string().min(1, "Name is required"),
      contactNumber: z.string().regex(/^\d{10}$/, "Invalid contact number"),
      contactEmail: z.string().email("Invalid email address"),
    })
  ).default([]),
});

const EditSupplier = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [showAppAccess, setShowAppAccess] = useState(false);

  // Fetch states list for the dropdown
  const { data: states = [], isLoading: isStatesLoading } = useQuery({
    queryKey: ["states"],
    queryFn: dropdownApi.fetchStates
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: 0,
      name: "",
      supplier_Code: "",
      sidDate: "",
      address: "",
      stateID: 0,
      gst: "",
      pan: "",
      tan: "",
      setApplicationAccess: false,
      userName: "",
      email: "",
      contactInformation: [],
      contactNumber: "",

    },
  });

  const { reset } = form;

  const { data: supplier, isLoading: isSupplierLoading } = useQuery({
    queryKey: ["supplier", params.id],
    queryFn: async () => {
      const response = await api.get(`/Supplier/${params.id}`);
      const supplierData = response.data;
      form.reset({
        id: supplierData.id,
        name: supplierData.name,
        supplier_Code: supplierData.supplier_Code,
        sidDate: supplierData.sidDate,
        address: supplierData.address,
        contactNumber: supplierData.contactNumber || "",
        stateID: supplierData.stateID,
        gst: supplierData.gst,
        pan: supplierData.pan,
        tan: supplierData.tan,
        setApplicationAccess: supplierData.setApplicationAccess || false,
        userName: supplierData.userName || "",
        email: supplierData.email || "",
        contactInformation: supplierData.contactInformation || [],
      });
      return supplierData;
    },
    enabled: !!params.id,
  });

  useEffect(() => {
    console.log(states.length)
    if (supplier && states.length > 0) {
      form.reset({
        id: supplier?.id,
        name: supplier?.name,
        supplier_Code: supplier?.supplier_Code,
        sidDate: supplier?.sidDate,
        address: supplier?.address,
        stateID: supplier?.stateID,
        gst: supplier?.gst,
        pan: supplier?.pan,
        tan: supplier?.tan,
        setApplicationAccess: supplier?.setApplicationAccess || false,
        userName: supplier?.userName || "",
        email: supplier?.email || "",
        contactInformation: supplier?.contactInformation || [],
      });
      setShowAppAccess(supplier?.setApplicationAccess || false);
    }
  }, [supplier, !isStatesLoading, states.length, form]);

  // Watch the supplier name and setApplicationAccess to auto-populate userName
  const supplierName = form.watch("name");
  const setApplicationAccess = form.watch("setApplicationAccess");

  useEffect(() => {
    if (setApplicationAccess && supplierName) {
      form.setValue("userName", supplierName.toLowerCase().replace(/\s+/g, '_'));
    }
  }, [supplierName, setApplicationAccess, form]);

  const updateSupplier = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      SupplierApi.updateSupplier(values, params.id),
    onSuccess: (data) => {
      if (!data.data.error) {
        form.reset();
        router.push("/admin/manage-supplier");
        return;
      }
      toast.error(data.data.error)
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let updatedSupplier = {
      ...supplier,
      ...values,
    };

    if (values.setApplicationAccess && values.email) {
      const [password] = values.email.split("@");
      updatedSupplier = {
        ...updatedSupplier,
        setApplicationAccess: true,
        userName: values.userName,
        email: values.email,
        password: password,
        isActive: supplier?.isActive
      };
    }
    updateSupplier.mutate(updatedSupplier);
  };

  if (isSupplierLoading) {
    return <Loader />
  }

  return (
    <div className="m-16 p-4 bg-white dark:bg-[#17171A]">
      <h1 className="text-2xl mb-6">Edit Supplier</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-3/5">
          {/* Supplier Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Supplier Code */}
          <FormField
            control={form.control}
            name="supplier_Code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Code *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Email address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* SID Date */}
          <FormField
            control={form.control}
            name="sidDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SID</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Enter SID" />
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
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* State Dropdown */}
          <FormField
            control={form.control}
            name="stateID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State *</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map((state: any) => (
                        <SelectItem key={state.id} value={String(state.id)}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* GST */}
          <FormField
            control={form.control}
            name="gst"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST ID *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter GST" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PAN */}
          <FormField
            control={form.control}
            name="pan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAN ID *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter PAN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* TAN */}
          <FormField
            control={form.control}
            name="tan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TAN ID *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter TAN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Application Access Section */}
          <div className="space-y-4 border-t pt-4">
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
          </div>

          <Button type="submit">Save</Button>
        </form>
      </Form>
    </div>
  );
};

export default EditSupplier;