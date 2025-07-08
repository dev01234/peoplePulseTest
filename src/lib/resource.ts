import * as z from "zod";

export const personalInfoSchema = z.object({
    isActive: z.boolean(),
    joiningDate: z.string().min(1, "Joining date is required"),
    gender: z.string().min(1, "Gender is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    officialMailingAddress: z.string().min(1, "Official mailing address is required"),
    pincode: z.string().length(6, "Pincode must be 6 digits"),
    stateID: z.string().min(1, "State is required"),
    hometownAddress: z.string().optional(),
    alternateContactNumber: z.string().optional(),
    emergencyContactNumber: z.string().min(10, "Emergency contact number is required"),
    fathersName: z.string().min(1, "Father's name is required"),
    mothersName: z.string().min(1, "Mother's name is required"),
});

export const personalAndProfessionalInfoSchema = personalInfoSchema.extend({
    // Professional info fields
    domainID: z.string().min(1, "Domain is required"),
    domainRoleID: z.string().min(1, "Role is required"),
    domainLevelID: z.string().min(1, "Level is required"),
    overallExperience: z.string().min(1, "Overall experience is required"),
    cwfid: z.string().min(1, "CWF ID is required"),
    officialEmailID: z.string().email("Invalid email format").min(1, "Official email is required"),
    laptopProviderID: z.string().min(1, "Laptop provider is required"),
    assetAssignedDate: z.string().min(1, "Asset assigned date is required"),
    assetModelNo: z.string().min(1, "Asset model number is required"),
    assetSerialNo: z.string().min(1, "Asset serial number is required"),
    poNo: z.string().min(1, "PO number is required"),
    poDate: z.string().min(1, "PO date is required"),
    lastWorkingDate: z.string().min(1, "Last working date is required"),
    attendanceRequired: z.boolean(),
});

export const academicSchema = z.array(
    z.object({
        name: z.string().min(1, "Academic name is required"),
        completionDate: z.string().min(1, "Completion date is required"),
        resultPercentage: z.union([z.string(), z.number()]).transform(val => val.toString()),
        attachment: z.string().min(1, "Attachment is required"),
    })
);

export const certificationSchema = z.array(
    z.object({
        name: z.string().min(1, "Certification name is required"),
        certificationNumber: z.string().min(1, "Certification number is required"),
        completionDate: z.string().min(1, "Completion date is required"),
        expiryDate: z.string().min(1, "Expiry date is required"),
        attachment: z.string().min(1, "Attachment is required"),
    })
);

export const documentsSchema = z.object({
    joining: z.object({
        offerLetter: z.string().min(1, "Offer letter is required"),
        joiningLetter: z.string().min(1, "Joining letter is required"),
        appraisalLetter: z.string().min(1, "Appraisal letter is required"),
        panCard: z.string().min(1, "PAN card is required"),
        aadharCard: z.string().min(1, "Aadhar card is required"),
        passport: z.string().optional(),
        drivingLicense: z.string().optional(),
    }),
    bgv: z.array(
        z.object({
            name: z.string().min(1, "Document name is required"),
            description: z.string().min(1, "Description is required"),
            attachment: z.string().min(1, "Attachment is required"),
        })
    ),
});

export const professionalInfoSchema = z.object({
    domainID: z.string().min(1, "Domain is required"),
    domainRoleID: z.string().min(1, "Role is required"),
    domainLevelID: z.string().min(1, "Level is required"),
    overallExperience: z.string().min(1, "Overall experience is required"),
    cwfid: z.string().min(1, "CWF ID is required"),
    officialEmailID: z.string().email("Invalid email format").min(1, "Official email is required"),
    laptopProviderID: z.string().min(1, "Laptop provider is required"),
    assetAssignedDate: z.string().min(1, "Asset assigned date is required"),
    assetModelNo: z.string().min(1, "Asset model number is required"),
    assetSerialNo: z.string().min(1, "Asset serial number is required"),
    poNo: z.string().min(1, "PO number is required"),
    poDate: z.string().min(1, "PO date is required"),
    lastWorkingDate: z.string().min(1, "Last working date is required"),
    attendanceRequired: z.boolean(),
});