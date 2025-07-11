"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PersonalInfoForm from "@/components/resource-form/personal-info-form";
import AcademicInfoForm from "@/components/resource-form/academic-info-form";
import CertificationForm from "@/components/resource-form/certification-form";
import DocumentsForm from "@/components/resource-form/documents-form";
import { toast } from "sonner";
import api from "@/lib/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import { personalAndProfessionalInfoSchema, academicSchema, certificationSchema, documentsSchema } from "@/lib/resource";
import { useUserStore } from "@/store/userStore";

const formTabs = [
  { id: "personal", label: "Personal Information" },
  { id: "academic", label: "Academic Details" },
  { id: "certification", label: "Certification Details" },
  { id: "documents", label: "Documents" },
];

interface ResourceInformation {
  id: number;
  resourceID: number;
  personal: any;
  professional: any;
  documents: {
    resourceInformationID: number;
    bgv: any[];
    joining: any;
    id: number;
  };
  academic: any[];
  certification: any[];
}

export default function ResourceForm() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const [resourceInfo, setResourceInfo] = useState<ResourceInformation | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    resourceID: 0,
    personal: {},
    academic: [],
    certification: [],
    documents: {
      resourceInformationID: 0,
      id: 0,
      joining: {},
      bgv: [],
    },
    professional: {},
  });

  const { user } = useUserStore()

  const [formValidation, setFormValidation] = useState({
    personal: false,
    academic: false,
    certification: false,
    documents: false,
    professional: false,
  });

  const [hasData, setHasData] = useState({
    personal: false,
    academic: false,
    certification: false,
    documents: false,
    professional: false,
  });

  useEffect(() => {
    const fetchResourceInfo = async () => {
      try {
        const response = await api.get(`/ResourceInformation/${params.id}`);
        const data = response.data;
        setResourceInfo(data);
        setFormData({
          id: data.id,
          resourceID: data.resourceID,
          personal: data.personal || {},
          academic: data.academic || [],
          certification: data.certification || [],
          documents: {
            resourceInformationID: data?.documents?.resourceInformationID,
            id: data.documents?.id || 0,
            joining: data.documents?.joining || {},
            bgv: data.documents?.bgv || [],
          },
          professional: data.professional || {},
        });

        // Check if sections have data
        setHasData({
          personal: data.personal && Object.keys(data.personal).length > 0,
          academic: data.academic && data.academic.length > 0,
          certification: data.certification && data.certification.length > 0,
          documents: data.documents && (
            Object.keys(data.documents.joining || {}).length > 0 ||
            (data.documents.bgv || []).length > 0
          ),
          professional: data.professional && Object.keys(data.professional).length > 0,
        });

        // Validate pre-filled data
        validatePrefilledData(data);
      } catch (error) {
        console.error("Error fetching resource:", error);
        toast.error("Error loading resource information");
      }
    };

    fetchResourceInfo();
  }, [params.id]);

  const validatePrefilledData = async (data: ResourceInformation) => {
    const validationResults = {
      personal: false,
      academic: false,
      certification: false,
      documents: false,
    };

    try {
      if (data.personal && Object.keys(data.personal).length > 0) {
        // We'll validate both personal and professional data together
        const combinedData = {
          ...data.personal,
          ...data.professional
        };
        await personalAndProfessionalInfoSchema.parseAsync(combinedData);
        validationResults.personal = true;
      }

      if (data.academic && data.academic.length > 0) {
        await academicSchema.parseAsync(data.academic);
        validationResults.academic = true;
      }

      if (data.certification && data.certification.length > 0) {
        await certificationSchema.parseAsync(data.certification);
        validationResults.certification = true;
      }

      if (data.documents) {
        await documentsSchema.parseAsync(data.documents);
        validationResults.documents = true;
      }

      setFormValidation(validationResults);
    } catch (error) {
      console.error("Validation error for prefilled data:", error);
    }
  };

  const validateSection = async (section: string, data: any) => {
    try {
      switch (section) {
        case "personal": 
          // Now validating both personal and professional data together
          await personalAndProfessionalInfoSchema.parseAsync(data);
          break;
        case "academic":
          await academicSchema.parseAsync(data);
          break;
        case "certification":
          await certificationSchema.parseAsync(data);
          break;
        case "documents":
          await documentsSchema.parseAsync(data);
          break;
      }
      setFormValidation(prev => ({ ...prev, [section]: true }));
      return true;
    } catch (error) {
      console.error(`Validation error in ${section}:`, error);
      return false;
    }
  };

  const handleSave = async (section: string, data: any) => {
    if (!resourceInfo) return;

    const isValid = await validateSection(section, data);
    if (!isValid) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    // Create a copy of the current form data
    let updatedData = { ...formData };

    if (section === "personal") {
      // Extract personal and professional data from the combined form
      const personalData = {
        isActive: data.isActive,
        joiningDate: data.joiningDate,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        officialMailingAddress: data.officialMailingAddress,
        pincode: data.pincode,
        stateID: data.stateID,
        hometownAddress: data.hometownAddress,
        alternateContactNumber: data.alternateContactNumber,
        emergencyContactNumber: data.emergencyContactNumber,
        fathersName: data.fathersName,
        mothersName: data.mothersName,
        resourceInformationID: resourceInfo.id,
        id: resourceInfo.personal?.id || 0
      };
      
      const professionalData = {
        domainID: data.domainID,
        domainRoleID: data.domainRoleID,
        domainLevelID: data.domainLevelID,
        overallExperience: data.overallExperience,
        cwfid: data.cwfid,
        officialEmailID: data.officialEmailID,
        laptopProviderID: data.laptopProviderID,
        assetAssignedDate: data.assetAssignedDate,
        assetModelNo: data.assetModelNo,
        assetSerialNo: data.assetSerialNo,
        poNo: data.poNo,
        poDate: data.poDate,
        lastWorkingDate: data.lastWorkingDate,
        attendanceRequired: data.attendanceRequired,
        resourceInformationID: resourceInfo.id,
        id: resourceInfo.professional?.id || 0
      };
      
      // Update the form data with the separated personal and professional data
      updatedData = {
        ...updatedData,
        personal: personalData,
        professional: professionalData
      };
    } else if (section === "academic") {
      updatedData.academic = data.map((item: any) => ({
        ...item,
        resourceInformationID: resourceInfo.id
      }));
    } else if (section === "certification") {
      updatedData.certification = data.map((item: any) => ({
        ...item,
        resourceInformationID: resourceInfo.id
      }));
    } else if (section === "documents") {
      updatedData.documents = {
        ...data,
        resourceInformationID: resourceInfo?.documents?.resourceInformationID,
        id: resourceInfo.documents?.id || 0,
        joining: {
          ...data.joining,
          documentsID: resourceInfo.documents?.joining?.documentsID || 0,
          id: resourceInfo.documents?.joining?.id || 0
        },
        bgv: data.bgv.map((item: any) => ({
          ...item,
          documentsID: resourceInfo.documents?.id || 0
        }))
      };
    }

    setFormData(updatedData);

    try {
      await api.put(`/ResourceInformation/${resourceInfo.id}`, updatedData);
      toast.success("Personal and professional details saved successfully");
      
      if (section === "personal") {
        // Update both personal and professional hasData states
        setHasData(prev => ({ ...prev, [section]: true }));
        setHasData(prev => ({ ...prev, professional: true }));
        
        // Update both personal and professional validation states
        setFormValidation(prev => ({ ...prev, [section]: true }));
        setFormValidation(prev => ({ ...prev, professional: true }));
      } else {
        // For other sections, just update their own state
        setHasData(prev => ({ ...prev, [section]: true }));
      }
    } catch (error) {
      console.error("Error saving details:", error);
      toast.error("Error while saving details");
    }
  };

  const canNavigateAway = (currentTab: string) => {
    return hasData[currentTab] || formValidation[currentTab];
  };

  const handleNext = () => {
    const currentIndex = formTabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < formTabs.length - 1 && canNavigateAway(activeTab)) {
      setActiveTab(formTabs[currentIndex + 1].id);
    } else {
      return null
    }
  };

  const handlePrevious = () => {
    const currentIndex = formTabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(formTabs[currentIndex - 1].id);
    }
  };

  const handleTabChange = (tabId: string) => {
    // Prevent handling same tab clicks
    if (tabId === activeTab) return;

    const currentIndex = formTabs.findIndex((tab) => tab.id === activeTab);
    const newIndex = formTabs.findIndex((tab) => tab.id === tabId);

    if (newIndex <= currentIndex || canNavigateAway(activeTab)) {
      setActiveTab(tabId);
    } else {
      toast.error("Please complete and save the current section before proceeding");
    }
  };

  const handleSubmit = async () => {
    if (!resourceInfo) return;

    // Check if all sections have either data or are validated
    const allSectionsComplete = Object.keys(hasData).every(
      section => section === "professional" || hasData[section] || formValidation[section]
    );

    if (!allSectionsComplete) {
      toast.error("Please complete all sections before submitting");
      return;
    }

    try {
      await api.put(`/ResourceInformation/${resourceInfo.id}`, formData);
      toast.success("Form submitted successfully");
      router.push(`/${user.role}/resource-information`);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error while submitting form");
    }
  };

  return (
    <div className="container mx-auto p-16">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          {formTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="personal">
          <PersonalInfoForm
            id={params.id}
            initialData={formData.personal}
            onSave={(data) => handleSave("personal", data)}
          />
        </TabsContent>
        <TabsContent value="academic">
          <AcademicInfoForm
            id={params.id}
            initialData={formData.academic}
            onSave={(data) => handleSave("academic", data)}
          />
        </TabsContent>
        <TabsContent value="certification">
          <CertificationForm
            id={params.id}
            initialData={formData.certification}
            onSave={(data) => handleSave("certification", data)}
          />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsForm
            id={params.id}
            initialData={formData.documents}
            onSave={(data) => handleSave("documents", data)}
          />
        </TabsContent>
      </Tabs>
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={activeTab === formTabs[0].id}
        >
          Previous
        </Button>
        {activeTab === formTabs[formTabs.length - 1].id ? (
          <Button onClick={handleSubmit} disabled={!Object.entries(hasData).filter(([key]) => key !== "professional").every(([_, value]) => value) && !Object.entries(formValidation).filter(([key]) => key !== "professional").every(([_, value]) => value)}>
            Submit
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canNavigateAway(activeTab)}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}