import api from "@/lib/axiosInstance";
import { z } from "zod";

export const publicHolidayFormSchema =  z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters."),
    description: z.string().min(2, "Description must be at least 2 characters."),
    phDate: z.date({ required_error: "A date is required." }),
    isPublic: z.boolean().default(true),
    isActive: z.boolean().default(true),
  });

export const PublicHolidayApi = {
     fetchHoliday: async () => {
        const response = await api.get("/PublicHolidays");
        return response.data;
      },

      deleteHoliday: async (id: number) => {
        await api.delete(`/PublicHolidays/${id}`);
      },

      createholiday:async (values: z.infer<typeof publicHolidayFormSchema>) => {
        return await api.post("/PublicHolidays", values);
      },

      updateholiday:async (values: z.infer<typeof publicHolidayFormSchema>, id:string) => {
        return await api.put(`/PublicHolidays/${id}`, values);
      },

      fetchholiday: async (id: string) => {
        const response = await api.get(`/PublicHolidays/${id}`);
        return response.data;
      },
      
}