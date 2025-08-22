import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plane, 
  Camera, 
  Battery, 
  Wifi, 
  MapPin, 
  Navigation, 
  AlertTriangle,
  Play,
  Square,
  RotateCcw,
  Zap,
  Eye,
  Shield,
  Package
} from 'lucide-react';
import { droneService, DroneConfig, FlightData, AerialDetectionResult } from '@/services/DroneService';
import { useToast } from '@/components/ui/use-toast';

interface DroneControllerProps {
  onAerialAnalysis?: (result: AerialDetectionResult) => void;
  siteCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

const DroneController: React.FC<DroneControllerProps> = ({ 
  onAerialAnalysis,
  siteCoordinates = { latitude: -1.2921, longitude: 36.8219 } 
}) => {
  const { toast } = useToast();
  const [drones, setDrones] = useState<DroneConfig[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<DroneConfig | null>(null);
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AerialDetectionResult[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Load available drones
    const availableDrones = droneService.getDrones();
    setDrones(availableDrones);
    
    if (availableDrones.length > 0 && !selectedDrone) {
      setSelectedDrone(availableDrones[0]);
    }

    // Set up event listeners
    droneService.on('flight_data_update', handleFlightDataUpdate);
    droneService.on('aerial_analysis', handleAerialAnalysis);
    droneService.on('low_battery_warning', handleLowBattery);
    droneService.on('drone_connected', handleDroneConnected);

    return () => {
      // Cleanup would go here in a real implementation
    };
  }, []);

  useEffect(() => {
    if (selectedDrone) {
      const currentFlightData = droneService.getFlightData(selectedDrone.id);
      setFlightData(currentFlightData);
    }
  }, [selectedDrone]);

  const handleFlightDataUpdate = (data: FlightData) => {
    if (selectedDrone && data.droneId === selectedDrone.id) {
      setFlightData(data);
    }
  };

  const handleAerialAnalysis = (result: AerialDetectionResult) => {
    setAnalysisResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    onAerialAnalysis?.(result);
  };

  const handleLowBattery = ({ droneId, batteryLevel }: { droneId: string; batteryLevel: number }) => {
    toast({
      title: "Low Battery Warning",
      description: `Drone ${droneId} battery at ${batteryLevel.toFixed(1)}%`,
      variant: "destructive",
    });
  };

  const handleDroneConnected = (drone: DroneConfig) => {
    setDrones(prev => [...prev, drone]);
    toast({
      title: "Drone Connected",
      description: `${drone.name} is ready for operation`,
    });
  };

  const connectNewDrone = async () => {
    setIsConnecting(true);
    try {
      const newDrone = {
        id: `drone_${Date.now()}`,
        name: "Aerial Survey Drone",
        model: "DJI Mavic 3",
        type: 'dji' as const,
        connectionType: 'wifi' as const,
        capabilities: {
          maxFlightTime: 45,
          maxRange: 15000,
          maxAltitude: 500,
          hasGimbal: true,
          hasGPS: true,
          videoQuality: '4k' as const,
          nightVision: false,
          thermalCamera: true,
        },
      };

      const success = await droneService.connectDrone(newDrone);
      if (success) {
        toast({
          title: "Drone Connected",
          description: "Drone is ready for aerial observation",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to drone",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect drone",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const startFlight = async () => {
    if (!selectedDrone) return;

    try {
      const mission = {
        waypoints: [
          { ...siteCoordinates, altitude: 50 },
          { latitude: siteCoordinates.latitude + 0.001, longitude: siteCoordinates.longitude, altitude: 75 },
          { latitude: siteCoordinates.latitude, longitude: siteCoordinates.longitude + 0.001, altitude: 100 },
        ],
        autoReturn: true,
        maxFlightTime: 30,
      };

      const success = await droneService.startFlight(selectedDrone.id, mission);
      if (success) {
        toast({
          title: "Flight Started",
          description: "Drone is now airborne and beginning survey",
        });
      }
    } catch (error) {
      toast({
        title: "Flight Error",
        description: "Could not start flight mission",
        variant: "destructive",
      });
    }
  };

  const landDrone = async () => {
    if (!selectedDrone) return;

    try {
      await droneService.landDrone(selectedDrone.id);
      toast({
        title: "Landing Initiated",
        description: "Drone is returning to base",
      });
    } catch (error) {
      toast({
        title: "Landing Error", 
        description: "Could not initiate landing",
        variant: "destructive",
      });
    }
  };

  const startAerialStream = async () => {
    if (!selectedDrone) return;

    try {
      const url = await droneService.getAerialStream(selectedDrone.id, 'high');
      if (url) {
        setStreamUrl(url);
        setIsStreaming(true);
        toast({
          title: "Live Stream Started",
          description: "Aerial view is now active",
        });
      }
    } catch (error) {
      toast({
        title: "Stream Error",
        description: "Could not start aerial stream",
        variant: "destructive",
      });
    }
  };

  const stopAerialStream = () => {
    setStreamUrl(null);
    setIsStreaming(false);
  };

  const requestAnalysis = async (type: 'progress' | 'safety' | 'inventory' | 'all') => {
    if (!selectedDrone) return;

    try {
      await droneService.requestAerialAnalysis(selectedDrone.id, type);
      toast({
        title: "Analysis Requested",
        description: `Running ${type} analysis on aerial footage`,
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Could not request aerial analysis",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: DroneConfig['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'flying': return 'bg-blue-500';
      case 'landing': return 'bg-yellow-500';
      case 'low_battery': return 'bg-orange-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: DroneConfig['status']) => {
    switch (status) {
      case 'connected': return 'Ready';
      case 'flying': return 'In Flight';
      case 'landing': return 'Landing';
      case 'low_battery': return 'Low Battery';
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
  };

  if (drones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Drone Controller
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="mb-4">
            <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No drones connected</p>
          </div>
          <Button onClick={connectNewDrone} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect Drone"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drone Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Aerial Observation System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {drones.map((drone) => (
              <div
                key={drone.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedDrone?.id === drone.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setSelectedDrone(drone)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{drone.name}</h3>
                  <Badge className={getStatusColor(drone.status)}>
                    {getStatusLabel(drone.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{drone.model}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Battery className="h-4 w-4" />
                    <span>{drone.batteryLevel?.toFixed(0) || '--'}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wifi className="h-4 w-4" />
                    <span>WiFi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDrone && (
        <Tabs defaultValue="control" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="stream">Live Feed</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="flight">Flight Data</TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Flight Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={startFlight}
                    disabled={selectedDrone.status === 'flying' || selectedDrone.status === 'landing'}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Take Off
                  </Button>
                  <Button
                    onClick={landDrone}
                    disabled={selectedDrone.status !== 'flying'}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Land
                  </Button>
                  <Button
                    onClick={() => landDrone()}
                    disabled={selectedDrone.status !== 'flying'}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Emergency Land
                  </Button>
                  <Button
                    onClick={() => droneService.controlDrone(selectedDrone.id, 'return_home')}
                    disabled={selectedDrone.status !== 'flying'}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Return Home
                  </Button>
                </div>

                {selectedDrone.status === 'flying' && flightData && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{flightData.position.altitude.toFixed(0)}m</div>
                      <div className="text-sm text-muted-foreground">Altitude</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{flightData.speed.toFixed(1)}m/s</div>
                      <div className="text-sm text-muted-foreground">Speed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{flightData.signalStrength.toFixed(0)}%</div>
                      <div className="text-sm text-muted-foreground">Signal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{flightData.batteryLevel.toFixed(0)}%</div>
                      <div className="text-sm text-muted-foreground">Battery</div>
                      <Progress value={flightData.batteryLevel} className="mt-1" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stream" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Live Aerial Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={startAerialStream}
                      disabled={isStreaming || selectedDrone.status !== 'flying'}
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Start Stream
                    </Button>
                    <Button
                      onClick={stopAerialStream}
                      disabled={!isStreaming}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <Square className="h-4 w-4" />
                      Stop Stream
                    </Button>
                  </div>

                  <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    {isStreaming ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="h-12 w-12 mx-auto mb-2" />
                          <p>Live Aerial Feed</p>
                          <Badge className="mt-2 bg-red-500">LIVE</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-400">No aerial feed active</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  AI Aerial Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      onClick={() => requestAnalysis('progress')}
                      disabled={selectedDrone.status !== 'flying'}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Progress
                    </Button>
                    <Button
                      onClick={() => requestAnalysis('safety')}
                      disabled={selectedDrone.status !== 'flying'}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Safety
                    </Button>
                    <Button
                      onClick={() => requestAnalysis('inventory')}
                      disabled={selectedDrone.status !== 'flying'}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Inventory
                    </Button>
                    <Button
                      onClick={() => requestAnalysis('all')}
                      disabled={selectedDrone.status !== 'flying'}
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Full Analysis
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Analysis Results</h4>
                    {analysisResults.length === 0 ? (
                      <p className="text-muted-foreground">No analysis results yet</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {analysisResults.map((result, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Analysis {new Date(result.timestamp).toLocaleTimeString()}
                              </span>
                              <Badge variant="outline">
                                {result.detections.length} detections
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              {result.detections.map((detection, detIndex) => (
                                <div key={detIndex} className="text-sm">
                                  <span className="font-medium">{detection.type}:</span>{' '}
                                  {detection.description} ({(detection.confidence * 100).toFixed(0)}%)
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flight" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Flight Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flightData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Latitude</label>
                        <p className="text-sm text-muted-foreground">
                          {flightData.position.latitude.toFixed(6)}°
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Longitude</label>
                        <p className="text-sm text-muted-foreground">
                          {flightData.position.longitude.toFixed(6)}°
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Altitude</label>
                        <p className="text-sm text-muted-foreground">
                          {flightData.position.altitude.toFixed(1)}m
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Pitch</label>
                        <p className="text-sm text-muted-foreground">
                          {flightData.orientation.pitch.toFixed(1)}°
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Roll</label>
                        <p className="text-sm text-muted-foreground">
                          {flightData.orientation.roll.toFixed(1)}°
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Yaw</label>
                        <p className="text-sm text-muted-foreground">
                          {flightData.orientation.yaw.toFixed(1)}°
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Flight Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Battery Level</span>
                          <span>{flightData.batteryLevel.toFixed(1)}%</span>
                        </div>
                        <Progress value={flightData.batteryLevel} />
                        
                        <div className="flex justify-between pt-2">
                          <span>Signal Strength</span>
                          <span>{flightData.signalStrength.toFixed(0)}%</span>
                        </div>
                        <Progress value={flightData.signalStrength} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No flight data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DroneController;