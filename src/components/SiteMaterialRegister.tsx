import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Package, AlertTriangle, CheckCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface MaterialRecord {
  id: string;
  material_type: string;
  quantity: number;
  unit: string;
  supplier_info: string;
  batch_number?: string;
  qr_code?: string;
  condition: string;
  location_on_site: string;
  received_date: string;
  notes?: string;
  status: string;
  verified: boolean;
  project_id: string;
}

interface SiteMaterialRegisterProps {
  projectId?: string;
}

export const SiteMaterialRegister: React.FC<SiteMaterialRegisterProps> = ({ projectId }) => {
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // New material form state
  const [newMaterial, setNewMaterial] = useState({
    material_type: '',
    quantity: 0,
    unit: 'pieces',
    supplier_info: '',
    batch_number: '',
    qr_code: '',
    condition: 'good',
    location_on_site: '',
    notes: ''
  });

  useEffect(() => {
    fetchUserProfile();
    fetchMaterials();
  }, [projectId]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('scanned_receivables')
        .select('*')
        .order('received_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      } else if (userProfile?.id) {
        // If no specific project, show materials for projects owned by the user
        const { data: userProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('builder_id', userProfile.id);
        
        if (userProjects && userProjects.length > 0) {
          query = query.in('project_id', userProjects.map(p => p.id));
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedMaterials: MaterialRecord[] = (data || []).map(item => ({
        id: item.id,
        material_type: item.material_type,
        quantity: item.quantity || 0,
        unit: item.unit || 'pieces',
        supplier_info: item.supplier_info || 'Unknown',
        batch_number: item.batch_number,
        qr_code: item.qr_code,
        condition: item.condition || 'good',
        location_on_site: 'Site Storage', // Default location
        received_date: new Date(item.received_at).toLocaleDateString(),
        notes: item.notes,
        status: item.received_status || 'received',
        verified: item.verified || false,
        project_id: item.project_id || ''
      }));

      setMaterials(formattedMaterials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    try {
      if (!userProfile?.id) {
        toast.error('User profile not found');
        return;
      }

      // Use provided projectId or get from user's projects
      let targetProjectId = projectId;
      if (!targetProjectId) {
        const { data: userProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('builder_id', userProfile.id)
          .limit(1);
        
        if (userProjects && userProjects.length > 0) {
          targetProjectId = userProjects[0].id;
        } else {
          toast.error('No project found');
          return;
        }
      }

      const { error } = await supabase
        .from('scanned_receivables')
        .insert({
          material_type: newMaterial.material_type,
          quantity: newMaterial.quantity,
          unit: newMaterial.unit,
          supplier_info: newMaterial.supplier_info,
          batch_number: newMaterial.batch_number || null,
          qr_code: newMaterial.qr_code || `MANUAL-${Date.now()}`,
          condition: newMaterial.condition,
          notes: newMaterial.notes,
          received_status: 'received',
          verified: true,
          project_id: targetProjectId,
          received_by: userProfile.id,
          scanned_by: userProfile.id
        });

      if (error) throw error;

      toast.success('Material added successfully');
      setIsAddDialogOpen(false);
      setNewMaterial({
        material_type: '',
        quantity: 0,
        unit: 'pieces',
        supplier_info: '',
        batch_number: '',
        qr_code: '',
        condition: 'good',
        location_on_site: '',
        notes: ''
      });
      fetchMaterials();
    } catch (error) {
      console.error('Error adding material:', error);
      toast.error('Failed to add material');
    }
  };

  const getStatusBadge = (status: string, verified: boolean) => {
    if (verified) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
    }
    
    switch (status) {
      case 'received':
        return <Badge variant="secondary">Received</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'damaged':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Damaged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'good':
        return <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>;
      case 'damaged':
        return <Badge variant="destructive">Damaged</Badge>;
      case 'poor':
        return <Badge variant="secondary">Poor</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.material_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (material.batch_number && material.batch_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || material.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalQuantity = materials.reduce((sum, material) => sum + material.quantity, 0);
  const verifiedMaterials = materials.filter(m => m.verified).length;
  const damagedMaterials = materials.filter(m => m.condition === 'damaged').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Site Material Register</h1>
          <p className="text-muted-foreground">Track and manage materials on your construction site</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Material</DialogTitle>
              <DialogDescription>Register a new material to the site inventory</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="material_type">Material Type</Label>
                <Input
                  id="material_type"
                  value={newMaterial.material_type}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, material_type: e.target.value }))}
                  placeholder="e.g., Cement, Steel Bars, Bricks"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newMaterial.quantity}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={newMaterial.unit} onValueChange={(value) => setNewMaterial(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="tonnes">Tonnes</SelectItem>
                      <SelectItem value="bags">Bags</SelectItem>
                      <SelectItem value="m3">m³</SelectItem>
                      <SelectItem value="m2">m²</SelectItem>
                      <SelectItem value="meters">Meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="supplier_info">Supplier</Label>
                <Input
                  id="supplier_info"
                  value={newMaterial.supplier_info}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, supplier_info: e.target.value }))}
                  placeholder="Supplier name or company"
                />
              </div>
              
              <div>
                <Label htmlFor="batch_number">Batch Number (Optional)</Label>
                <Input
                  id="batch_number"
                  value={newMaterial.batch_number}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, batch_number: e.target.value }))}
                  placeholder="Batch or lot number"
                />
              </div>
              
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={newMaterial.condition} onValueChange={(value) => setNewMaterial(prev => ({ ...prev, condition: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newMaterial.notes}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or observations"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMaterial}>Add Material</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-muted-foreground">Different material types</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">Items on site</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedMaterials}</div>
            <p className="text-xs text-muted-foreground">Verified materials</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Damaged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{damagedMaterials}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search materials, suppliers, or batch numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="damaged">Damaged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Material Inventory</CardTitle>
          <CardDescription>
            Complete list of materials registered on site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>QR Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No materials found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Try adjusting your filters' 
                          : 'Add materials to get started'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.material_type}</TableCell>
                    <TableCell>{material.quantity} {material.unit}</TableCell>
                    <TableCell>{material.supplier_info}</TableCell>
                    <TableCell>{material.batch_number || '-'}</TableCell>
                    <TableCell>{getConditionBadge(material.condition)}</TableCell>
                    <TableCell>{getStatusBadge(material.status, material.verified)}</TableCell>
                    <TableCell>{material.received_date}</TableCell>
                    <TableCell>
                      {material.qr_code && (
                        <Badge variant="outline" className="font-mono text-xs">
                          <QrCode className="w-3 h-3 mr-1" />
                          {material.qr_code.slice(-6)}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};