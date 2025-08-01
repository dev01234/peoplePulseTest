import api from "@/lib/axiosInstance";
import { z } from "zod";


export interface ProjectType {
  id: number;
  projectCode: string;
  startDate: string;
  clientCode: string;
  endDate: string;
  isActive: boolean;
  name?: string | null;
  pmName?: string | null;
  rmName?: string | null;
}

export type PaginatedResponse = ProjectType[];


export const projectFormSchema = z.object({
  isActive: z.boolean(),
  name: z.string().min(2, "Project name must be at least 2 characters"),
  projectCode: z.string().min(1, "Project code is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  clientID: z.number().min(1, "Client is required"),
  pmid: z.number().min(1, "Project manager is required"),
  rmid: z.number(),
  deliveryMotionID: z.number().min(1, "Delivery motion is required"),
  segmentID: z.number().min(1, "Segment is required"),
  supportTypeID: z.number().min(1, "Support Type is required"),
});

export const ProjectApi = {

  fetchProjects: async () => {
    const response = await api.get("/Project");
    return response.data.items;
  },
  fetchProjectsPaginated: async (pageNumber: number, pageSize: number): Promise<PaginatedResponse> => {
    const response = await api.get(`/Project?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  deactivateProjects: async (id: number) => {
    await api.patch("/Project", { id, isActive: false });
  },

  createProject: async (values: z.infer<typeof projectFormSchema>) => {
    return await api.post("/Project", values);
  },

  updateProject: async (values: z.infer<typeof projectFormSchema>, id: string) => {
    return await api.put(`/Project/${id}`, values);
  },

  fetchProject: async (id: string) => {
    const response = await api.get(`/Project/${id}`);
    return response.data;
  },

}