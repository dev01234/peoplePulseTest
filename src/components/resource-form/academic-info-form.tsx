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

interface AcademicInfoFormProps {
  initialData: any[];
  onSave: (data: any) => void;
  id: string;
}

export default function AcademicInfoForm({ initialData, onSave, id }: AcademicInfoFormProps) {
  const [academicDetails, setAcademicDetails] = useState(
    initialData.map(detail => ({
      ...detail,
      completionDate: detail.completionDate ? detail.completionDate.split('T')[0] : '',
      name: detail.name || '',
      resultPercentage: detail.resultPercentage?.toString() || '',
      attachment: detail.attachment || '',
      attachmentURL: detail.attachmentURL || '',
      id: detail.id || 0,
      resourceInformationID: detail.resourceInformationID || 0
    })) || []
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData.length > 0) {
      setAcademicDetails(
        initialData.map(detail => ({
          ...detail,
          completionDate: detail.completionDate ? detail.completionDate.split('T')[0] : '',
          name: detail.name || '',
          resultPercentage: detail.resultPercentage?.toString() || '',
          attachment: detail.attachment || '',
          attachmentURL: detail.attachmentURL || '',
          id: detail.id || 0,
          resourceInformationID: detail.resourceInformationID || 0
        }))
      );
    }
  }, [initialData]);

  const handleAddAcademic = () => {
    setAcademicDetails([
      ...academicDetails,
      {
        name: "",
        completionDate: "",
        resultPercentage: "",
        attachment: "",
        attachmentURL: "",
        id: 0,
        resourceInformationID: 0
      },
    ]);
  };

  const handleRemove = async (index: number) => {
    const detail = academicDetails[index];
    if (detail.attachment) {
      try {
        await api.post("/BlobFile/delete", { name: detail.attachment });
        toast.success("File deleted successfully");
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file");
        return;
      }
    }
    setAcademicDetails(academicDetails.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updatedDetails = [...academicDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };
    setAcademicDetails(updatedDetails);
  };

  const renameFile = (file) => {
    const fileName = `new-${Date.now()}-${file.name}`;  // Rename logic can be customized
    return new File([file], fileName, { type: file.type });
  };

  const handleFileUpload = async (index: number, file: File) => {
    try {
      setIsUploading(true);

      const renamedFile = renameFile(file);

      const formData = new FormData();
      formData.append("file", renamedFile);

      const response = await api.post('/blobFile/upload', formData, {
        headers: {
          'Content-Type': "multipart/form-data",
          'x-filename': renamedFile.name
        }
      });

      const updatedDetails = [...academicDetails];
      updatedDetails[index] = {
        ...updatedDetails[index],
        attachment: renamedFile.name,
        attachmentURL: response.data.fileUrl,
      };
      setAcademicDetails(updatedDetails);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    // Validate that all required fields are filled
    const isValid = academicDetails.every(detail =>
      detail.name &&
      detail.completionDate &&
      detail.resultPercentage &&
      detail.attachment
    );

    if (!isValid) {
      toast.error("Please fill all required fields");
      return;
    }

    onSave(academicDetails);
  };

  const removeFile = async (index: number) => {
    const cert = academicDetails[index];
    if (cert.attachment) {
      try {
        await api.post(`/BlobFile/delete`, { name: cert.attachment });
        const updatedDetails = [...academicDetails];
        updatedDetails[index] = {
          ...updatedDetails[index],
          attachment: "",
          attachmentURL: "",
        };
        setAcademicDetails(updatedDetails);
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
        <CardTitle>Academic Details</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAcademic}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Academic Detail
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {academicDetails.map((detail, index) => (
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
                <Label>Academic Name *</Label>
                <Select
                  value={detail.name}
                  onValueChange={(value) => handleChange(index, "name", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Bachelor">Bachelor&apos;s Degree</SelectItem>
                    <SelectItem value="Master">Master&apos;s Degree</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Completion Date *</Label>
                <Input
                  type="date"
                  value={detail.completionDate}
                  onChange={(e) => handleChange(index, "completionDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Result Percentage *</Label>
                <Input
                  type="number"
                  value={detail.resultPercentage}
                  onChange={(e) => handleChange(index, "resultPercentage", e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
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
                  {detail.attachmentURL && (
                    <>
                      <a
                        href={detail.attachmentURL}
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
        {academicDetails.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isUploading}>Save</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}