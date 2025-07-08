import api from "@/lib/axiosInstance";
import { z } from "zod";

export interface ClientRow {
  id: number;
  name: string;
  clientCode : string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  locationName: string;
  address: string;
  stateName: string;
  regionName: string;
  notes: string;
}

export type PaginatedResponse = ClientRow[];

export const spocSchema = z.object({
  id: z.number().optional(),
  isActive: z.boolean().default(true),
  name: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().optional(),
});

export const clientFormSchema = z.object({
  id: z.number().default(0), // Optional, default provided
  isActive: z.boolean({ required_error: "Status is required" }),
  name: z.string().min(5, "Logo Name is required with at least 5 characters"),
  clientCode: z.string().default("C000EH123"), // Optional, default provided
  shortName: z.string().min(3, "Short Name is required with at least 3 characters"),
  startDate: z.date({ required_error: "Start Date is required" }),
  endDate: z.date({ required_error: "End Date is required" }),
  address: z.string().optional(), // Optional field
  notes: z.string().optional(),   // Optional field
  regionID: z.number().min(1, "Region is required"),
  stateID: z.number().min(1, "State is required"),
  locationID: z.number().min(1, "Location is required"),
  pincode: z.string().min(1, "Pincode is required"),
  spocid: z.number().default(0),   // Optional, default provided
  spoc: spocSchema.optional(),
});

export const ClientApi = {

  fetchClients: async () => {
    const response = await api.get("/Client");
    return response.data.items;
  },


      fetchClientsPaginated: async (pageNumber: number, pageSize: number): Promise<PaginatedResponse> => {
        const response = await api.get(`/Client?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return response.data;
      },

      deactivateClients: async (id: number) => {
        await api.patch("/Client", { id, isActive: false });
      },

      createClient:async (values: z.infer<typeof clientFormSchema>) => {
        return await api.post("/Client", values);
      },

      updateClient:async (values: z.infer<typeof clientFormSchema>, id:string) => {
        return await api.put(`/Client/${id}`, values);
      },


      //make sure to add fetchclient(singular)
}