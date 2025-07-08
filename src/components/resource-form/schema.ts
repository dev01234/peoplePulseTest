import * as z from "zod";

const academicDetailSchema = z.object({
  academicName: z.string().min(1, "Academic name is required"),
  completionDate: z.string().min(1, "Completion date is required"),
  resultPercentage: z.number().min(0).max(100),
  attachment: z.string().min(1, "Attachment is required"),
});

const certificationDetailSchema = z.object({
  certificationName: z.string().min(1, "Certification name is required"),
  certificationNumber: z.string().min(1, "Certification number is required"),
  completionDate: z.string().min(1, "Completion date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  attachment: z.string().min(1, "Attachment is required"),
});

const joiningDocumentSchema = z.object({
  offerLetter: z.string().min(1, "Offer letter is required"),
  joiningLetter: z.string().min(1, "Joining letter is required"),
  appraisalLetter: z.string().min(1, "Appraisal letter is required"),
  panCard: z.string().min(1, "PAN card is required"),
  aadharCard: z.string().min(1, "Aadhar card is required"),
  passport: z.string().optional(),
  drivingLicense: z.string().optional(),
});

const bgvDocumentSchema = z.object({
  documentName: z.string().min(1, "Document name is required"),
  description: z.string().min(1, "Description is required"),
  attachments: z.array(z.string()).min(1, "At least one attachment is required"),
});

export const resourceFormSchema = z.object({
  // Personal Information
  resourceStatus: z.enum(["Active", "De-Active"]),
  resourceId: z.string(),
  fullName: z.string(),
  mobile: z.string(),
  personalEmail: z.string().email(),
  projectName: z.string(),
  reportingManager: z.string(),
  supplierName: z.string(),
  joiningDate: z.string(),
  joiningLocation: z.string(),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.string(),
  officialMailingAddress: z.string().min(1, "Official mailing address is required"),
  pinCode: z.string().min(6).max(6),
  state: z.string(),
  hometownAddress: z.string().optional(),
  alternateContactNumber: z.string().optional(),
  emergencyContactNumber: z.string().min(1, "Emergency contact number is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),

  // Academic Details
  academicDetails: z.array(academicDetailSchema),

  // Certification Details
  certificationDetails: z.array(certificationDetailSchema),

  // Experience and Documents
  overallExperience: z.number().min(0),
  joiningDocuments: joiningDocumentSchema,
  bgvDocuments: z.array(bgvDocumentSchema),

  // Professional Details
  domain: z.string(),
  role: z.string(),
  level: z.string(),
  attendanceRequired: z.boolean(),
  cwfId: z.string().optional(),
  officialEmail: z.string().email().optional(),
  laptop: z.enum(["Supplier", "HPE", "Rented", "Business Funded"]),
  assetAssignedDate: z.string().optional(),
  assetModelNo: z.string().optional(),
  assetSerialNo: z.string().optional(),
  poNo: z.string(),
  poDate: z.string(),
  lastWorkingDate: z.string().optional(),
});

export type ResourceFormData = z.infer<typeof resourceFormSchema>;