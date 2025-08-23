import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapLocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  disabled?: boolean;
  placeholder?: string;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  disabled = false,
  placeholder = "Click on map to select location"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [manualCoords, setManualCoords] = useState({
    latitude: initialLocation?.latitude?.toString() || '',
    longitude: initialLocation?.longitude?.toString() || ''
  });

  const initializeMap = async () => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [initialLocation?.longitude || 36.8219, initialLocation?.latitude || -1.2921], // Default to Nairobi
        zoom: 10
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setIsMapReady(true);
        
        if (initialLocation) {
          addMarker(initialLocation.longitude, initialLocation.latitude);
        }
      });

      map.current.on('click', (e) => {
        if (disabled) return;
        
        const { lng, lat } = e.lngLat;
        const location: Location = {
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };
        
        setSelectedLocation(location);
        addMarker(lng, lat);
        setManualCoords({
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6)
        });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Invalid Mapbox token. Please check your token.');
    }
  };

  const addMarker = (lng: number, lat: number) => {
    if (marker.current) {
      marker.current.remove();
    }
    
    marker.current = new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([lng, lat])
      .addTo(map.current!);
  };

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location: Location = {
          latitude,
          longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        };
        
        setSelectedLocation(location);
        setManualCoords({
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        });

        if (map.current) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 15 });
          addMarker(longitude, latitude);
        }
        
        toast.success('Current location detected');
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your location. Please check permissions.');
      }
    );
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      toast.success('Location selected successfully');
    } else {
      toast.error('Please select a location first');
    }
  };

  const handleManualEntry = () => {
    const lat = parseFloat(manualCoords.latitude);
    const lng = parseFloat(manualCoords.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Please enter valid coordinates');
      return;
    }

    const location: Location = {
      latitude: lat,
      longitude: lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
    
    setSelectedLocation(location);
    
    if (map.current && isMapReady) {
      map.current.flyTo({ center: [lng, lat], zoom: 15 });
      addMarker(lng, lat);
    }
    
    toast.success('Location set from coordinates');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Picker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isMapReady && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mapbox-token">Mapbox Public Token (optional for map view)</Label>
              <Input
                id="mapbox-token"
                type="text"
                placeholder="Enter your Mapbox public token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Get your token from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
              </p>
            </div>
            <Button onClick={initializeMap} disabled={!mapboxToken.trim()}>
              Initialize Map
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="e.g., -1.2921"
              value={manualCoords.latitude}
              onChange={(e) => setManualCoords(prev => ({ ...prev, latitude: e.target.value }))}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="e.g., 36.8219"
              value={manualCoords.longitude}
              onChange={(e) => setManualCoords(prev => ({ ...prev, longitude: e.target.value }))}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualEntry}
            disabled={disabled || !manualCoords.latitude || !manualCoords.longitude}
          >
            Set Coordinates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={disabled}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Use Current Location
          </Button>
        </div>

        {isMapReady && (
          <>
            <div 
              ref={mapContainer} 
              className="w-full h-64 rounded-lg border"
              style={{ minHeight: '300px' }}
            />
            <div className="flex justify-between items-center">
              <Button 
                onClick={handleSaveLocation}
                disabled={!selectedLocation || disabled}
                className="w-full"
              >
                Save Location
              </Button>
            </div>
          </>
        )}

        {selectedLocation && (
          <div className="text-sm text-muted-foreground text-center">
            Selected: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </div>
        )}

        {!isMapReady && (
          <p className="text-sm text-muted-foreground text-center">
            {disabled ? "Location picker is disabled" : "Enter coordinates manually or add Mapbox token for map view"}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MapLocationPicker;