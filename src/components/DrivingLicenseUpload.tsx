import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DrivingLicenseUploadProps {
  onFileUploaded: (filePath: string) => void;
  currentFilePath?: string;
}

const DrivingLicenseUpload: React.FC<DrivingLicenseUploadProps> = ({ 
  onFileUploaded, 
  currentFilePath 
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, or PDF file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      // Create a unique file path - using timestamp for demo since no auth
      const timestamp = new Date().getTime();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `driving-license-${timestamp}.${fileExt}`;
      const filePath = `demo-user/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('driving-licenses')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      toast({
        title: "Upload successful",
        description: "Driving license document uploaded successfully"
      });

      onFileUploaded(filePath);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload driving license document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (filePath: string) => {
    if (filePath.toLowerCase().includes('.pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Driving License Document
        </CardTitle>
        <CardDescription>
          Upload a copy of your valid driving license (JPEG, PNG, or PDF format, max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentFilePath ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getFileIcon(currentFilePath)}
                <span>Driving license document uploaded</span>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You must upload a copy of your driving license to complete your application
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="license-upload">Upload Driving License</Label>
          <Input
            id="license-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>

        {selectedFile && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile.name)}
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button 
                onClick={uploadFile} 
                disabled={uploading}
                size="sm"
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Accepted formats: JPEG, PNG, PDF</p>
          <p>• Maximum file size: 5MB</p>
          <p>• Document must be clear and readable</p>
          <p>• License must be valid and not expired</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DrivingLicenseUpload;