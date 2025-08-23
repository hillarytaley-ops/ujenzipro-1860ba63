import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface DeliveryLocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  disabled?: boolean;
}

const DeliveryLocationPicker: React.FC<DeliveryLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  disabled = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialLocation ? [initialLocation.longitude, initialLocation.latitude] : [36.8219, -1.2921], // Default to Nairobi
        zoom: 12
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add click handler for location selection
      map.current.on('click', (e) => {
        if (disabled) return;
        
        const { lng, lat } = e.lngLat;
        const location: Location = {
          latitude: lat,
          longitude: lng
        };

        setSelectedLocation(location);
        
        // Remove existing marker
        if (marker.current) {
          marker.current.remove();
        }

        // Add new marker
        marker.current = new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        toast.success('Location pinned successfully');
      });

      // Add initial marker if location provided
      if (initialLocation) {
        marker.current = new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([initialLocation.longitude, initialLocation.latitude])
          .addTo(map.current);
      }

      setIsMapReady(true);
    } catch (error) {
      toast.error('Failed to initialize map. Please check your Mapbox token.');
      console.error('Map initialization error:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const handleSaveLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      toast.success('Delivery location saved');
    } else {
      toast.error('Please select a location on the map');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          setSelectedLocation(location);
          
          if (map.current) {
            map.current.flyTo({
              center: [location.longitude, location.latitude],
              zoom: 15
            });

            if (marker.current) {
              marker.current.remove();
            }

            marker.current = new mapboxgl.Marker({ color: '#ef4444' })
              .setLngLat([location.longitude, location.latitude])
              .addTo(map.current);
          }
          
          toast.success('Current location detected');
        },
        () => {
          toast.error('Unable to detect current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Delivery Location Picker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isMapReady && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
              <Input
                id="mapbox-token"
                type="text"
                placeholder="Enter your Mapbox public token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Get your token from{' '}
                <a 
                  href="https://account.mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
            <Button onClick={initializeMap} disabled={!mapboxToken.trim()}>
              Initialize Map
            </Button>
          </div>
        )}

        {isMapReady && (
          <>
            <div className="flex gap-2">
              <Button 
                onClick={getCurrentLocation} 
                variant="outline"
                disabled={disabled}
              >
                Use Current Location
              </Button>
              <Button 
                onClick={handleSaveLocation}
                disabled={!selectedLocation || disabled}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Location
              </Button>
            </div>

            <div 
              ref={mapContainer} 
              className="w-full h-64 rounded-lg border"
            />

            {selectedLocation && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected Location:</p>
                <p className="text-sm text-muted-foreground">
                  Lat: {selectedLocation.latitude.toFixed(6)}, 
                  Lng: {selectedLocation.longitude.toFixed(6)}
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {disabled 
                ? 'Viewing mode - location cannot be changed'
                : 'Click on the map to pin delivery location'
              }
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryLocationPicker;