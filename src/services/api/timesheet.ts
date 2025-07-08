import api from "@/lib/axiosInstance";
import { z } from "zod";

export const TimesheetApi = {
    

      saveTimesheet: async(values:any) => {
        const response = await api.post('/Timesheet',values)
        return response.data;
      },

      updateTimesheet: async(values:any, id:number) => {
        const response = await api.put(`/Timesheet/${id}`,values)
        return response.data;
      },

      fetchTimesheet:async(resourceId:any, strtweek:any) => {
        const response = await api.get(`/Timesheet/timesheet/${resourceId}/${strtweek}`)
      }

      //make sure to add fetchclient(singular)
}