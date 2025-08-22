export interface DroneConfig {
  id: string;
  name: string;
  model: string;
  type: 'dji' | 'parrot' | 'autel' | 'custom';
  connectionType: 'wifi' | 'radio' | 'cellular';
  capabilities: {
    maxFlightTime: number; // minutes
    maxRange: number; // meters
    maxAltitude: number; // meters
    hasGimbal: boolean;
    hasGPS: boolean;
    videoQuality: '720p' | '1080p' | '4k';
    nightVision: boolean;
    thermalCamera: boolean;
  };
  status: 'connected' | 'disconnected' | 'flying' | 'landing' | 'error' | 'low_battery';
  lastSeen?: Date;
  batteryLevel?: number;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
}

export interface FlightData {
  droneId: string;
  timestamp: Date;
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  orientation: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  speed: number;
  batteryLevel: number;
  signalStrength: number;
}

export interface AerialDetectionResult {
  droneId: string;
  timestamp: Date;
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  detections: Array<{
    type: 'structure' | 'material_pile' | 'vehicle' | 'person' | 'safety_hazard' | 'progress_marker';
    description: string;
    confidence: number;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    metadata?: {
      materialType?: string;
      vehicleType?: string;
      hazardLevel?: 'low' | 'medium' | 'high';
      progressPercentage?: number;
    };
  }>;
}

export class DroneService {
  private drones: Map<string, DroneConfig> = new Map();
  private flightData: Map<string, FlightData> = new Map();
  private eventCallbacks: Map<string, Function[]> = new Map();
  private flightMonitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Connect to a drone
  async connectDrone(config: Omit<DroneConfig, 'status' | 'lastSeen'>): Promise<boolean> {
    try {
      const droneConfig: DroneConfig = {
        ...config,
        status: 'disconnected',
        lastSeen: new Date(),
      };

      // Test connection based on drone type
      const connectionSuccessful = await this.testDroneConnection(droneConfig);
      
      if (connectionSuccessful) {
        droneConfig.status = 'connected';
        this.drones.set(config.id, droneConfig);
        this.startHealthMonitoring(config.id);
        this.emit('drone_connected', droneConfig);
        return true;
      } else {
        droneConfig.status = 'error';
        return false;
      }
    } catch (error) {
      console.error('Error connecting to drone:', error);
      return false;
    }
  }

  // Start flight mission
  async startFlight(droneId: string, mission?: {
    waypoints?: Array<{ latitude: number; longitude: number; altitude: number }>;
    autoReturn?: boolean;
    maxFlightTime?: number;
  }): Promise<boolean> {
    try {
      const drone = this.drones.get(droneId);
      if (!drone) {
        throw new Error('Drone not found');
      }

      if (drone.status !== 'connected') {
        throw new Error('Drone not connected');
      }

      // Pre-flight checks
      const preflightCheck = await this.performPreflightCheck(droneId);
      if (!preflightCheck.success) {
        throw new Error(`Pre-flight check failed: ${preflightCheck.errors.join(', ')}`);
      }

      // Start flight based on drone type
      await this.sendDroneCommand(droneId, 'takeoff', mission);
      
      drone.status = 'flying';
      this.startFlightMonitoring(droneId);
      this.emit('flight_started', { droneId, mission });
      
      return true;
    } catch (error) {
      console.error('Error starting flight:', error);
      return false;
    }
  }

  // Control drone movement
  async controlDrone(droneId: string, command: string, params?: any): Promise<boolean> {
    try {
      const drone = this.drones.get(droneId);
      if (!drone || drone.status !== 'flying') {
        return false;
      }

      return await this.sendDroneCommand(droneId, command, params);
    } catch (error) {
      console.error('Error controlling drone:', error);
      return false;
    }
  }

  // Land drone
  async landDrone(droneId: string, emergencyLanding?: boolean): Promise<boolean> {
    try {
      const drone = this.drones.get(droneId);
      if (!drone) {
        return false;
      }

      await this.sendDroneCommand(droneId, emergencyLanding ? 'emergency_land' : 'land');
      
      drone.status = 'landing';
      this.emit('landing_initiated', { droneId, emergency: emergencyLanding });
      
      // Simulate landing process
      setTimeout(() => {
        if (drone.status === 'landing') {
          drone.status = 'connected';
          this.stopFlightMonitoring(droneId);
          this.emit('flight_ended', { droneId });
        }
      }, 5000);
      
      return true;
    } catch (error) {
      console.error('Error landing drone:', error);
      return false;
    }
  }

  // Get live video stream from drone
  async getAerialStream(droneId: string, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<string | null> {
    try {
      const drone = this.drones.get(droneId);
      if (!drone) {
        return null;
      }

      // Simulate getting stream URL based on drone type
      const streamUrl = `rtmp://drone-${droneId}.stream/${quality}`;
      return streamUrl;
    } catch (error) {
      console.error('Error getting aerial stream:', error);
      return null;
    }
  }

  // Request AI analysis of aerial footage
  async requestAerialAnalysis(droneId: string, analysisType: 'progress' | 'safety' | 'inventory' | 'all'): Promise<AerialDetectionResult | null> {
    try {
      const drone = this.drones.get(droneId);
      if (!drone || drone.status !== 'flying') {
        return null;
      }

      const flightData = this.flightData.get(droneId);
      if (!flightData) {
        return null;
      }

      // Simulate AI analysis
      const detections: AerialDetectionResult['detections'] = [];
      
      if (analysisType === 'progress' || analysisType === 'all') {
        detections.push({
          type: 'progress_marker',
          description: 'Foundation construction 75% complete',
          confidence: 0.92,
          coordinates: {
            latitude: flightData.position.latitude + 0.0001,
            longitude: flightData.position.longitude + 0.0001,
          },
          metadata: {
            progressPercentage: 75,
          },
        });
      }

      if (analysisType === 'safety' || analysisType === 'all') {
        detections.push({
          type: 'safety_hazard',
          description: 'Workers without hard hats detected',
          confidence: 0.87,
          coordinates: {
            latitude: flightData.position.latitude - 0.0001,
            longitude: flightData.position.longitude - 0.0001,
          },
          metadata: {
            hazardLevel: 'medium' as const,
          },
        });
      }

      if (analysisType === 'inventory' || analysisType === 'all') {
        detections.push({
          type: 'material_pile',
          description: 'Cement bags inventory: ~50 bags',
          confidence: 0.89,
          coordinates: {
            latitude: flightData.position.latitude,
            longitude: flightData.position.longitude + 0.0002,
          },
          metadata: {
            materialType: 'cement',
          },
        });
      }

      const result: AerialDetectionResult = {
        droneId,
        timestamp: new Date(),
        position: flightData.position,
        detections,
      };

      this.emit('aerial_analysis', result);
      return result;
    } catch (error) {
      console.error('Error requesting aerial analysis:', error);
      return null;
    }
  }

  // Get connected drones
  getDrones(): DroneConfig[] {
    return Array.from(this.drones.values());
  }

  // Get current flight data
  getFlightData(droneId: string): FlightData | null {
    return this.flightData.get(droneId) || null;
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const callbacks = this.eventCallbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Private methods
  private async testDroneConnection(config: DroneConfig): Promise<boolean> {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.1; // 90% success rate
  }

  private async performPreflightCheck(droneId: string): Promise<{ success: boolean; errors: string[] }> {
    const drone = this.drones.get(droneId);
    if (!drone) {
      return { success: false, errors: ['Drone not found'] };
    }

    const errors: string[] = [];
    
    // Simulate various checks
    if (drone.batteryLevel && drone.batteryLevel < 30) {
      errors.push('Battery level too low for safe flight');
    }
    
    // Add more checks as needed
    
    return { success: errors.length === 0, errors };
  }

  private async sendDroneCommand(droneId: string, command: string, params?: any): Promise<boolean> {
    // Simulate sending command to actual drone
    console.log(`Sending command ${command} to drone ${droneId}`, params);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  private startFlightMonitoring(droneId: string): void {
    const interval = setInterval(() => {
      this.updateFlightData(droneId);
    }, 1000);
    
    this.flightMonitoringIntervals.set(droneId, interval);
  }

  private stopFlightMonitoring(droneId: string): void {
    const interval = this.flightMonitoringIntervals.get(droneId);
    if (interval) {
      clearInterval(interval);
      this.flightMonitoringIntervals.delete(droneId);
    }
  }

  private updateFlightData(droneId: string): void {
    const drone = this.drones.get(droneId);
    if (!drone || drone.status !== 'flying') {
      return;
    }

    const currentData = this.flightData.get(droneId);
    const newData: FlightData = {
      droneId,
      timestamp: new Date(),
      position: {
        latitude: currentData?.position.latitude || -1.2921 + (Math.random() - 0.5) * 0.001,
        longitude: currentData?.position.longitude || 36.8219 + (Math.random() - 0.5) * 0.001,
        altitude: 50 + Math.random() * 50, // 50-100m altitude
      },
      orientation: {
        pitch: (Math.random() - 0.5) * 10,
        roll: (Math.random() - 0.5) * 10,
        yaw: Math.random() * 360,
      },
      speed: Math.random() * 20, // 0-20 m/s
      batteryLevel: Math.max(0, (currentData?.batteryLevel || 100) - 0.1), // Decrease battery
      signalStrength: 80 + Math.random() * 20, // 80-100%
    };

    this.flightData.set(droneId, newData);
    this.emit('flight_data_update', newData);

    // Update drone config
    drone.gpsCoordinates = newData.position;
    drone.batteryLevel = newData.batteryLevel;

    // Check for low battery
    if (newData.batteryLevel < 20 && drone.status === 'flying') {
      drone.status = 'low_battery';
      this.emit('low_battery_warning', { droneId, batteryLevel: newData.batteryLevel });
    }
  }

  private startHealthMonitoring(droneId: string): void {
    // Simulate periodic health checks
    setInterval(() => {
      const drone = this.drones.get(droneId);
      if (drone) {
        drone.lastSeen = new Date();
      }
    }, 30000); // Every 30 seconds
  }

  // Disconnect drone
  async disconnectDrone(droneId: string): Promise<void> {
    const drone = this.drones.get(droneId);
    if (drone) {
      if (drone.status === 'flying') {
        await this.landDrone(droneId, true);
      }
      
      this.stopFlightMonitoring(droneId);
      this.drones.delete(droneId);
      this.flightData.delete(droneId);
      this.emit('drone_disconnected', { droneId });
    }
  }
}

// Singleton instance
export const droneService = new DroneService();