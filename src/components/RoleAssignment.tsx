import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

type UserRole = 'supplier' | 'builder' | 'admin';

const RoleAssignment: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('supplier');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const assignRole = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, we'll assign the role to the current user
      // In a real app, you'd look up the user by email first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      // Update or insert role in profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert([{
          user_id: user.id,
          role: role,
          full_name: user.email // fallback for display name
        }], {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Role ${role} assigned successfully! Please refresh the page.`,
      });

      setEmail('');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Assign User Role
        </CardTitle>
        <CardDescription>
          Demo: Assign yourself a role to access delivery features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email (Demo - uses your current account)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supplier">Supplier - Can create and manage deliveries</SelectItem>
              <SelectItem value="builder">Builder - Can view assigned deliveries</SelectItem>
              <SelectItem value="admin">Admin - Full access</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={assignRole} disabled={loading} className="w-full">
          {loading ? 'Assigning...' : 'Assign Role'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoleAssignment;