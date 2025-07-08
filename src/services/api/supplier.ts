import api from "@/lib/axiosInstance";
import { z } from "zod";


export const supplierContactSchema = z.object({
  id: z.number().default(0),
  isActive: z.boolean().default(true),
  contactTypeID: z
    .number({ required_error: "Contact type is required" })
    .min(1, "Select a valid contact type"),
  name: z.string().min(1, "Name is required"),
  contactNumber: z.string().min(10, { message: "Contact number is required." }),
  contactEmail: z.string().email("Invalid email address"),
});

export const supplierFormSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  sidDate: z.date({ required_error: "SID date is required" }),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.string().min(10, { message: "Contact number is required." }),
  stateID: z.number().min(1, "State is required"),
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
  email: z.string().optional(),
  stateName: z.string().min(1, "State Name is required"),
  contactInformation: z
    .array(supplierContactSchema)
    .min(1, "At least one contact is required"),
});

export interface SupplierRow {
  id: number;
  name: string;
  pan: string;
  gst: string;
  tan: string;
  supplier_Code: string;
  isActive: boolean;
}

export type PaginatedResponse = SupplierRow[];



export const SupplierApi = {

  fetchSuppliers: async () => {
    const response = await api.get("/Supplier");
    return response.data;
  },

  fetchSuppliersPaginated: async (pageNumber: number, pageSize: number): Promise<PaginatedResponse> => {
    const response = await api.get(`/Supplier?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },


  deactivateSuppliers: async (id: number) => {
    await api.patch("/Supplier", { id, isActive: false });
  },

  createSupplier: async (values: z.infer<typeof supplierFormSchema>) => {
    return await api.post("/Supplier", values);
  },

  updateSupplier: async (values: z.infer<typeof supplierFormSchema>, id: string) => {
    return await api.put(`/Supplier/${id}`, values);
  },

  fetchSupplier: async (id: string) => {
    const response = await api.get(`/Supplier/${id}`);
    return response.data;
  },

}