import api from "@/lib/axiosInstance";
import { verify } from "crypto";
import { z } from "zod";


export const baselineFormSchema = z.object({
  logoID: z.string().min(1, "Logo is required."),
  projectID: z.string().min(1, "Project is required."),
  type: z.string().min(1, "Type is required."),
  domainID: z.string().min(1, "Domain is required."),
  roleID: z.string().min(1, "Role is required."),
  levelID: z.string().min(1, "Level is required."),
  baseline: z.number().min(0, "Baseline must be a non-negative number."),
  domainNameAsPerCustomer: z.string().min(1, "Domain name as per customer is required."),
  notes: z.string().min(1, "Notes is required."),
});

export interface BaselineRow {
  id: number;
  logoName: string;
  projectName: string;
  type: string;
  domainName: string;
  roleName: string;
  levelName: string;
  baseline: number;
  domainNameAsPerCustomer: string;
  notes?: string;
  isActive: boolean;
}
export const BaselineApi = {
  fetchBaselines: async () => {
    const response = await api.get("/ProjectBaseline");
    return response.data;
  },

  deactivateBaseline: async (id: number) => {
    await api.patch("/ProjectBaseline", { id, isActive: false });
  },

  createBaseline: async (values: z.infer<typeof baselineFormSchema>) => {
    return await api.post("/ProjectBaseline", values);
  },

  verifyBaseline: async (id: number) => {
    return await api.get(`/ProjectBaseline/verify/${id}`);
  },

  updateBaseline: async (values: z.infer<typeof baselineFormSchema>, id: string) => {
    return await api.put(`/ProjectBaseline/${id}`, values);
  },

  fetchBaseline: async (id: number) => {
    const response = await api.get(`/ProjectBaseline/${id}`);
    return response.data;
  },

}