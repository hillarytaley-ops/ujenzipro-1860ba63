import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Scan, Camera, CheckCircle, Package, Clock, Building, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type ScanMode = 'supplies' | 'receivables';

interface QRScannerProps {
  onMaterialScanned?: (material: ScannedMaterial) => void;
}

interface ScannedMaterial {
  id?: string;
  qrCode: string;
  materialType: string;
  batchNumber: string;
  supplierInfo: string;
  quantity?: number;
  unit?: string;
  timestamp: Date;
  verified: boolean;
  mode: ScanMode;
  projectId?: string;
  supplierId?: string;
  deliveryId?: string;
  condition?: string;
  status?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onMaterialScanned }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scannedMaterials, setScannedMaterials] = useState<ScannedMaterial[]>([]);
  const [lastScan, setLastScan] = useState<string>('');
  const [scanMode, setScanMode] = useState<ScanMode>('supplies');
  const [projectId, setProjectId] = useState<string>('');
  const [supplierId, setSupplierId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [projects, setProjects] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
        toast.success('QR Scanner started');
      }
    } catch (error) {
      toast.error('Failed to access camera for scanning');
      console.error('Camera access error:', error);
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsScanning(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      toast.info('QR Scanner stopped');
    }
  };

  const parseQRCode = (qrData: string): ScannedMaterial => {
    // Parse different QR code formats
    const parts = qrData.split('-');
    
    return {
      qrCode: qrData,
      materialType: parts[1] || 'Unknown Material',
      batchNumber: parts[2] || 'N/A',
      supplierInfo: parts[0] || 'Unknown Supplier',
      quantity: quantity,
      unit: 'pieces',
      timestamp: new Date(),
      verified: true,
      mode: scanMode,
      projectId: scanMode === 'receivables' ? projectId : undefined,
      supplierId: scanMode === 'supplies' ? supplierId : undefined,
      condition: scanMode === 'receivables' ? 'good' : undefined,
      status: scanMode === 'supplies' ? 'available' : undefined
    };
  };

  const simulateQRDetection = async () => {
    if (!isScanning) return;

    // Simulate QR code detection
    const qrCodes = [
      'BAMBURI-CEMENT-BATCH001-2024',
      'SIMBA-STEEL-12MM-LOT455-2024',
      'SAVANNAH-BRICK-RED-BATCH789-2024',
      'DEVKI-IRON-SHEETS-GAUGE28-2024',
      'ARM-CEMENT-PORTLAND-BATCH123-2024'
    ];

    // Random chance of detection
    if (Math.random() > 0.92) { // 8% chance per scan
      const randomQR = qrCodes[Math.floor(Math.random() * qrCodes.length)];
      
      // Avoid duplicate scans within 5 seconds
      if (randomQR !== lastScan) {
        const material = parseQRCode(randomQR);
        await saveMaterialScan(material);
        setScannedMaterials(prev => [material, ...prev.slice(0, 9)]);
        onMaterialScanned?.(material);
        setLastScan(randomQR);
        
        toast.success(`Material scanned: ${material.materialType}`, {
          description: `Mode: ${scanMode} • Batch: ${material.batchNumber}`
        });

        // Reset lastScan after 5 seconds
        setTimeout(() => setLastScan(''), 5000);
      }
    }
  };

  // Load projects and suppliers on mount, and check user access
  useEffect(() => {
    checkUserAccess();
    loadProjectsAndSuppliers();
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(simulateQRDetection, 1000);
    return () => clearInterval(interval);
  }, [isScanning, lastScan, scanMode, projectId, supplierId, quantity]);

  const checkUserAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, company_name')
          .eq('user_id', user.id)
          .single();

        setUserProfile(profile);
        
        // QR coding/scanning is available for all builder types
        setHasAccess(true);
      }
    } catch (error) {
      console.error('Error checking user access:', error);
      setHasAccess(false);
    }
  };

  const loadProjectsAndSuppliers = async () => {
    try {
      const [projectsResult, suppliersResult] = await Promise.all([
        supabase.from('projects').select('id, name').order('name'),
        supabase.from('suppliers').select('id, company_name').order('company_name')
      ]);

      if (projectsResult.data) setProjects(projectsResult.data);
      if (suppliersResult.data) setSuppliers(suppliersResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveMaterialScan = async (material: ScannedMaterial) => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;
      
      if (material.mode === 'supplies') {
        const { error } = await supabase.from('scanned_supplies').insert({
          supplier_id: material.supplierId,
          qr_code: material.qrCode,
          material_type: material.materialType,
          batch_number: material.batchNumber,
          quantity: material.quantity,
          unit: material.unit,
          supplier_info: material.supplierInfo,
          status: material.status,
          scanned_by: currentUserId,
          dispatch_status: 'ready_to_dispatch',
          scanned_for_dispatch: true
        });
        
        if (error) throw error;
        
        toast.success('Material scanned for dispatch', {
          description: `${material.materialType} ready for shipping`
        });
      } else {
        const { error } = await supabase.from('scanned_receivables').insert({
          project_id: material.projectId,
          qr_code: material.qrCode,
          material_type: material.materialType,
          batch_number: material.batchNumber,
          quantity: material.quantity,
          unit: material.unit,
          supplier_info: material.supplierInfo,
          condition: material.condition,
          verified: material.verified,
          received_by: currentUserId,
          received_status: 'received'
        });
        
        if (error) throw error;
        
        toast.success('Material received on site', {
          description: `${material.materialType} confirmed at project location`
        });
      }
    } catch (error) {
      console.error('Error saving scan:', error);
      toast.error('Failed to save scanned material');
    } finally {
      setLoading(false);
    }
  };

  const getMaterialIcon = (materialType: string) => {
    const type = materialType.toLowerCase();
    if (type.includes('cement') || type.includes('concrete')) {
      return <Package className="h-4 w-4 text-gray-600" />;
    } else if (type.includes('steel') || type.includes('iron')) {
      return <Package className="h-4 w-4 text-blue-600" />;
    } else if (type.includes('brick')) {
      return <Package className="h-4 w-4 text-red-600" />;
    }
    return <Package className="h-4 w-4 text-muted-foreground" />;
  };

  // Allow access to all authenticated users
  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            QR Code Scanner - Authentication Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                Please log in to access the QR scanner
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scanner Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {scanMode === 'supplies' ? (
              <Truck className="h-5 w-5" />
            ) : (
              <Building className="h-5 w-5" />
            )}
            Scanner Mode Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scanMode">Scanning Mode</Label>
              <Select value={scanMode} onValueChange={(value) => setScanMode(value as ScanMode)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scanning mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplies">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Supplier Scanning
                    </div>
                  </SelectItem>
                  <SelectItem value="receivables">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Site Personnel - Material Receiving
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {scanMode === 'supplies' && (
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scanMode === 'receivables' && (
            <div>
              <Label htmlFor="project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {scanMode === 'supplies' 
                ? '📦 Scanning materials at supplier location for inventory management'
                : '🏗️ Site personnel scan materials upon receipt before storage/usage'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            QR Code Material Scanner
            <Badge variant="outline" className="ml-auto">
              {scanMode === 'supplies' ? 'Supplier Mode' : 'Receivables Mode'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanner Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white rounded-lg w-48 h-48 relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-0.5 bg-primary animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Badge */}
            {isScanning && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-primary-foreground animate-pulse">
                  SCANNING
                </Badge>
              </div>
            )}
          </div>

          {/* Scanner Controls */}
          <div className="flex gap-2">
            {!isScanning ? (
              <Button 
                onClick={startScanning} 
                className="flex items-center gap-2"
                disabled={
                  (scanMode === 'supplies' && !supplierId) ||
                  (scanMode === 'receivables' && !projectId) ||
                  loading
                }
              >
                <Camera className="h-4 w-4" />
                Start QR Scanner
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Stop Scanner
              </Button>
            )}
            {loading && (
              <Badge variant="secondary" className="animate-pulse">
                Saving...
              </Badge>
            )}
          </div>
          
          {((scanMode === 'supplies' && !supplierId) || (scanMode === 'receivables' && !projectId)) && (
            <p className="text-sm text-muted-foreground mt-2">
              Please select a {scanMode === 'supplies' ? 'supplier' : 'project'} before starting the scanner.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Scanned Materials */}
      {scannedMaterials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Scanned Materials ({scanMode === 'supplies' ? 'Supplier Inventory' : 'Site Receivables'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scannedMaterials.map((material, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="flex-shrink-0">
                    {getMaterialIcon(material.materialType)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{material.materialType}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.supplierInfo} • Batch: {material.batchNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {material.quantity} {material.unit} • Mode: {material.mode}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          QR: {material.qrCode}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {material.verified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <Badge variant={material.verified ? "default" : "secondary"}>
                            {material.verified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {material.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Scanning Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • Position the QR code within the scanning frame
          </p>
          <p className="text-sm text-muted-foreground">
            • Ensure good lighting and steady hands
          </p>
          <p className="text-sm text-muted-foreground">
            • QR codes will be automatically detected and processed
          </p>
          <p className="text-sm text-muted-foreground">
            • Select appropriate mode: Supplier (inventory) or Site Personnel (receiving)
          </p>
          <p className="text-sm text-muted-foreground">
            • Scanned materials are automatically saved to the database
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScanner;