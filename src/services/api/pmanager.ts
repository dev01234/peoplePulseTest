import api from "@/lib/axiosInstance";
import { z } from "zod";


export const pmanagerFormSchema = z.object({
    firstName: z.string().min(1, "first name is required."),
    lastName: z.string(),
    email: z.string().min(1, "email is required."),
    contactNumber: z.string().min(1, "contact number is required."),
    managerTypeID: z.number().min(1, "manager type is required."),
    isActive: z.boolean(),
  });

  export interface PManagerRow{
    id: number;
    userID: string;
    pmCode: string;
    name: string;
    firstName :string;
    lastName :string;
    email :string;
    contactNumber :string;
    managerTypeID: string;
    managerTypeName: string;
    isActive: boolean;
  }
  
export const PManagerApi = {
     fetchPManagers: async () => {
        const response = await api.get("/pm");
        return response.data;
      },

      deactivatePManager: async (id: number) => {
        await api.patch("/pm", { id, isActive: false });
      },

      createPManager:async (values: z.infer<typeof pmanagerFormSchema>) => {
        return await api.post("/pm", values);
      },

      updatePManager:async (values: z.infer<typeof pmanagerFormSchema>, id:string) => {
        return await api.put(`/pm/${id}`, values);
      },

      fetchPManager: async (id: number) => {
        const response = await api.get(`/pm/${id}`);
        return response.data;
      },
      
}