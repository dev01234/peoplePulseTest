"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axiosInstance";

interface CertificationFormProps {
  initialData: any[];
  onSave: (data: any) => void;
  id: string;
}

export default function CertificationForm({ initialData, onSave, id }: CertificationFormProps) {
  const [certifications, setCertifications] = useState(
    initialData.map(cert => ({
      ...cert,
      name: cert.name || "",
      certificationNumber: cert.certificationNumber || "",
      completionDate: cert.completionDate ? cert.completionDate.split('T')[0] : "",
      expiryDate: cert.expiryDate ? cert.expiryDate.split('T')[0] : "",
      attachment: cert.attachment || "",
      attachmentURL: cert.attachmentURL || "",
      resourceInformationID: cert.resourceInformationID || 0,
      id: cert.id || 0
    })) || []
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData.length > 0) {
      setCertifications(
        initialData.map(cert => ({
          ...cert,
          name: cert.name || "",
          certificationNumber: cert.certificationNumber || "",
          completionDate: cert.completionDate ? cert.completionDate.split('T')[0] : "",
          expiryDate: cert.expiryDate ? cert.expiryDate.split('T')[0] : "",
          attachment: cert.attachment || "",
          attachmentURL: cert.attachmentURL || "",
          resourceInformationID: cert.resourceInformationID || 0,
          id: cert.id || 0
        }))
      );
    }
  }, [initialData]);

  const handleAddCertification = () => {
    setCertifications([
      ...certifications,
      {
        name: "",
        certificationNumber: "",
        completionDate: "",
        expiryDate: "",
        attachment: "",
        attachmentURL: "",
        resourceInformationID: 0,
        id: 0
      },
    ]);
  };

  const handleRemove = async (index: number) => {
    const cert = certifications[index];
    if (cert.attachment) {
      try {
        await api.get(`/BlobFile/delete/${cert.attachment}`);
        toast.success("File deleted successfully");
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file");
        return;
      }
    }
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updatedCertifications = [...certifications];
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      [field]: value,
    };
    setCertifications(updatedCertifications);
  };

  const renameFile = (file) => {
    const fileName = `new-${Date.now()}-${file.name}`;  // Rename logic can be customized
    return new File([file], fileName, { type: file.type });
  };

  const handleFileUpload = async (index: number, file: File) => {
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

      const updatedCertifications = [...certifications];
      updatedCertifications[index] = {
        ...updatedCertifications[index],
        attachment: renamedFile.name,
        attachmentURL: response.data.fileUrl,
      };
      setCertifications(updatedCertifications);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    onSave(certifications);
  };

  const removeFile = async (index: number) => {
    const cert = certifications[index];
    if (cert.attachment) {
      try {
        await api.post(`/BlobFile/delete`, {
          name: cert.attachment
        });
        const updatedCertifications = [...certifications];
        updatedCertifications[index] = {
          ...updatedCertifications[index],
          attachment: "",
          attachmentURL: "",
        };
        setCertifications(updatedCertifications);
        toast.success("File deleted successfully");
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file");
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Certification Details</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCertification}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {certifications.map((cert, index) => (
          <div key={index} className="border p-4 rounded-lg space-y-4">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certification Name *</Label>
                <Select
                  value={cert.name}
                  onValueChange={(value) => handleChange(index, "name", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select certification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AWS">AWS Certified</SelectItem>
                    <SelectItem value="Azure">Microsoft Azure</SelectItem>
                    <SelectItem value="GCP">Google Cloud</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Certification Number *</Label>
                <Input
                  type="text"
                  value={cert.certificationNumber}
                  onChange={(e) => handleChange(index, "certificationNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Completion Date *</Label>
                <Input
                  type="date"
                  value={cert.completionDate}
                  onChange={(e) => handleChange(index, "completionDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Expiry Date *</Label>
                <Input
                  type="date"
                  value={cert.expiryDate}
                  onChange={(e) => handleChange(index, "expiryDate", e.target.value)}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Attachment *</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(index, file);
                      }
                    }}
                    disabled={isUploading}
                  />
                  {cert.attachmentURL && (
                    <>
                      <a
                        href={cert.attachmentURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View
                      </a>
                      <Button variant="ghost" onClick={() => removeFile(index)}>
                        <RotateCcw />
                      </Button>
                    </>
                  )}
                </div>
                {isUploading && (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {certifications.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isUploading}>Save</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}