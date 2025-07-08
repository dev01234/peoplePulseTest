"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axiosInstance";

interface DocumentsFormProps {
  initialData: {
    joining: any;
    bgv: any[];
    resourceInformationID?: number;
    id?: number;
  };
  onSave: (data: any) => void;
  id: string;
}

export default function DocumentsForm({ initialData, onSave, id }: DocumentsFormProps) {
  const [joiningDocs, setJoiningDocs] = useState({
    offerLetter: initialData.joining?.offerLetter || "",
    offerLetterURL: initialData.joining?.offerLetterURL || "",
    joiningLetter: initialData.joining?.joiningLetter || "",
    joiningLetterURL: initialData.joining?.joiningLetterURL || "",
    appraisalLetter: initialData.joining?.appraisalLetter || "",
    appraisalLetterURL: initialData.joining?.appraisalLetterURL || "",
    panCard: initialData.joining?.panCard || "",
    panCardURL: initialData.joining?.panCardURL || "",
    aadharCard: initialData.joining?.aadharCard || "",
    aadharCardURL: initialData.joining?.aadharCardURL || "",
    passport: initialData.joining?.passport || "",
    passportURL: initialData.joining?.passportURL || "",
    drivingLicense: initialData.joining?.drivingLicense || "",
    drivingLicenseURL: initialData.joining?.drivingLicenseURL || "",
    documentsID: initialData.joining?.documentsID || null,
    id: initialData.joining?.id || null
  });

  const [bgvDocs, setBgvDocs] = useState(
    initialData.bgv?.map(doc => ({
      ...doc,
      documentsID: doc.documentsID || null,
      id: doc.id || null
    })) || []
  );
  
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData.joining) {
      setJoiningDocs({
        offerLetter: initialData.joining.offerLetter || "",
        offerLetterURL: initialData.joining.offerLetterURL || "",
        joiningLetter: initialData.joining.joiningLetter || "",
        joiningLetterURL: initialData.joining.joiningLetterURL || "",
        appraisalLetter: initialData.joining.appraisalLetter || "",
        appraisalLetterURL: initialData.joining.appraisalLetterURL || "",
        panCard: initialData.joining.panCard || "",
        panCardURL: initialData.joining.panCardURL || "",
        aadharCard: initialData.joining.aadharCard || "",
        aadharCardURL: initialData.joining.aadharCardURL || "",
        passport: initialData.joining.passport || "",
        passportURL: initialData.joining.passportURL || "",
        drivingLicense: initialData.joining.drivingLicense || "",
        drivingLicenseURL: initialData.joining.drivingLicenseURL || "",
        documentsID: initialData.joining.documentsID || null,
        id: initialData.joining.id || null
      });
    }

    if (initialData.bgv) {
      setBgvDocs(
        initialData.bgv.map(doc => ({
          ...doc,
          documentsID: doc.documentsID || null,
          id: doc.id || null
        }))
      );
    }
  }, [initialData]);

  const renameFile = (file) => {
    const fileName = `new-${Date.now()}-${file.name}`;  // Rename logic can be customized
    return new File([file], fileName, { type: file.type });
  };

  const handleJoiningFileUpload = async (field: string, file: File) => {
    try {
      setIsUploading(true);
      
const renamedFile = renameFile(file)      
const formData = new FormData();
      formData.append("file", renamedFile);
      
      const response = await api.post('/blobFile/upload', formData, {
        headers: {
          'Content-Type': "multipart/form-data",
          'x-filename': renamedFile.name
        }
      });

      setJoiningDocs(prev => ({
        ...prev,
        [field]: renamedFile.name,
        [`${field}URL`]: response.data.fileUrl
      }));
      
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddBgv = () => {
    setBgvDocs([
      ...bgvDocs,
      {
        name: "",
        description: "",
        attachment: "",
        attachmentURL: "",
        documentsID: 0,
        id: 0
      },
    ]);
  };

  const handleRemoveBgv = async(index: number) => {
    const doc = bgvDocs[index];
    
    try {
      if (doc.attachment) {
        await api.get(`/BlobFile/delete/${doc.attachment}`);
        toast.success("File deleted successfully");
      }
      setBgvDocs(bgvDocs.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleBgvChange = (index: number, field: string, value: any) => {
    const updatedBgvDocs = [...bgvDocs];
    updatedBgvDocs[index] = {
      ...updatedBgvDocs[index],
      [field]: value,
    };
    setBgvDocs(updatedBgvDocs);
  };

  const handleBgvFileUpload = async (index: number, file: File) => {
    try {
      setIsUploading(true);
      
      const reamedFile = renameFile(file) 
      const formData = new FormData();
      formData.append("file", reamedFile);
      
      const response = await api.post('/blobFile/upload', formData, {
        headers: {
          'Content-Type': "multipart/form-data",
          'x-filename': reamedFile.name
        }
      });

      const updatedBgvDocs = [...bgvDocs];
      updatedBgvDocs[index] = {
        ...updatedBgvDocs[index],
        attachment: reamedFile.name,
        attachmentURL: response.data.fileUrl,
      };
      setBgvDocs(updatedBgvDocs);
      
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async() => {
    const documentsData = {
      joining: joiningDocs,
      bgv: bgvDocs,
      resourceInformationID: initialData.resourceInformationID,
      id: initialData.id
    };
    onSave(documentsData);
  };

  const resetJoiningFile = async (field: string) => {
    try {
      const fileName = joiningDocs[field];
      if (fileName) {
        await api.post(`/BlobFile/delete`,{name:fileName});
        setJoiningDocs(prev => ({
          ...prev,
          [field]: "",
          [`${field}URL`]: ""
        }));
        toast.success("File deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const resetBgvFile = async (index: number) => {
    const doc = bgvDocs[index];
    if (doc.attachment) {
      try {
        await api.post(`/BlobFile/delete`,{
          name:doc.attachment
        });
        const updatedBgvDocs = [...bgvDocs];
        updatedBgvDocs[index] = {
          ...updatedBgvDocs[index],
          attachment: "",
          attachmentURL: "",
        };
        setBgvDocs(updatedBgvDocs);
        toast.success("File deleted successfully");
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file");
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Joining Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'offerLetter', label: 'Offer Letter', required: true },
              { key: 'joiningLetter', label: 'Joining Letter', required: true },
              { key: 'appraisalLetter', label: 'Appraisal Letter', required: true },
              { key: 'panCard', label: 'PAN Card', required: true },
              { key: 'aadharCard', label: 'Aadhar Card', required: true },
              { key: 'passport', label: 'Passport', required: false },
              { key: 'drivingLicense', label: 'Driving License', required: false },
            ].map((doc) => (
              <div key={doc.key} className="space-y-2">
                <Label>{doc.label} {doc.required && '*'}</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleJoiningFileUpload(doc.key, file);
                      }
                    }}
                    disabled={isUploading}
                  />
                  {joiningDocs[`${doc.key}URL`] && (
                    <>
                      <a 
                        href={joiningDocs[`${doc.key}URL`]}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View
                      </a>
                      <Button 
                        variant="ghost" 
                        onClick={() => resetJoiningFile(doc.key)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>BGV Documents</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddBgv}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add BGV Document
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {bgvDocs.map((doc, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveBgv(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Name *</Label>
                  <Input
                    type="text"
                    value={doc.name}
                    onChange={(e) => handleBgvChange(index, "name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={doc.description}
                    onChange={(e) => handleBgvChange(index, "description", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Document *</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleBgvFileUpload(index, file);
                        }
                      }}
                      disabled={isUploading}
                    />
                    {doc.attachmentURL && (
                      <>
                        <a 
                          href={doc.attachmentURL}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View
                        </a>
                        <Button 
                          variant="ghost" 
                          onClick={() => resetBgvFile(index)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isUploading}>Save</Button>
      </div>
    </div>
  );
}