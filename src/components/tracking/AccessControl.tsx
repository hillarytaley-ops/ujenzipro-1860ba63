import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Project, UserRole } from '@/hooks/useDeliveryData';

interface AccessControlProps {
  isOpen: boolean;
  onClose: () => void;
  onAccessGranted: () => void;
  userProjects: Project[];
  userRole: UserRole | null;
}

export const AccessControl: React.FC<AccessControlProps> = ({
  isOpen,
  onClose,
  onAccessGranted,
  userProjects,
  userRole
}) => {
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const { toast } = useToast();

  const verifyAccessCode = async () => {
    if (!accessCodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter an access code",
        variant: "destructive",
      });
      return;
    }

    try {
      const matchingProject = userProjects.find(project => 
        project.access_code === accessCodeInput.trim()
      );

      if (matchingProject) {
        onAccessGranted();
        onClose();
        setAccessCodeInput('');
        toast({
          title: "Access Granted",
          description: `Access granted for project: ${matchingProject.name}`,
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid access code for your projects",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying access code:', error);
      toast({
        title: "Error",
        description: "Failed to verify access code",
        variant: "destructive",
      });
    }
  };

  if (userRole === 'admin') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Security Access Required</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please enter your project access code to continue.
          </p>
          <div className="space-y-2">
            <Label htmlFor="access-code">Access Code</Label>
            <Input
              id="access-code"
              type="password"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={verifyAccessCode}>
              Verify Access
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};