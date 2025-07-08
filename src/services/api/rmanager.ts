import api from "@/lib/axiosInstance";
import { z } from "zod";


export const rmFormSchema = z.object({
    firstName: z.string().min(1, "first name is required."),
    lastName: z.string(),
    email: z.string().min(1, "email is required."),
    contactNumber: z.string().min(1, "contact number is required."),
    projectManagerID: z.number().min(1, "Project manager is required."),
    isActive: z.boolean(),
  });

  export interface RManagerRow{
    id: number;
    userID: string;
    rmCode: string;
    name: string;
    firstName :string;
    lastName :string;
    email :string;
    contactNumber :string;
    projectManagerID: string;
    projectManagerName: string;
    isActive: boolean;
  }
  
export const RManagerApi = {
     fetchRManagers: async () => {
        const response = await api.get("/rm");
        return response.data.items;
      },

      deactivateRManager: async (id: number) => {
        await api.patch("/rm", { id, isActive: false });
      },

      createRManager:async (values: z.infer<typeof rmFormSchema>) => {
        return await api.post("/rm", values);
      },

      updateRManager:async (values: z.infer<typeof rmFormSchema>, id:string) => {
        return await api.put(`/rm/${id}`, values);
      },

      fetchRManager: async (id: number) => {
        const response = await api.get(`/rm/${id}`);
        return response.data;
      },
      
}