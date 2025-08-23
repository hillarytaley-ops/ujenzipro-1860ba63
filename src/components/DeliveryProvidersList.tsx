import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, Star, MapPin, Phone, Mail, Building2, User, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeliveryProvider {
  id: string;
  provider_name: string;
  provider_type: 'individual' | 'organization';
  contact_person?: string;
  phone: string;
  email?: string;
  address?: string;
  vehicle_types: string[];
  service_areas: string[];
  capacity_kg?: number;
  hourly_rate?: number;
  per_km_rate?: number;
  is_verified: boolean;
  is_active: boolean;
  rating: number;
  total_deliveries: number;
}

interface DeliveryProvidersListProps {
  onProviderSelect?: (provider: DeliveryProvider) => void;
}

export const DeliveryProvidersList: React.FC<DeliveryProvidersListProps> = ({ onProviderSelect }) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<DeliveryProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'total_deliveries' | 'hourly_rate'>('rating');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('delivery_providers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      
      if (error) throw error;
      setProviders((data || []) as DeliveryProvider[]);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error loading providers",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers
    .filter(provider => {
      const matchesSearch = provider.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (provider.contact_person && provider.contact_person.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesArea = !selectedArea || provider.service_areas.includes(selectedArea);
      const matchesVehicle = !selectedVehicleType || provider.vehicle_types.includes(selectedVehicleType);
      
      return matchesSearch && matchesArea && matchesVehicle;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'total_deliveries') return b.total_deliveries - a.total_deliveries;
      if (sortBy === 'hourly_rate') {
        const aRate = a.hourly_rate || 0;
        const bRate = b.hourly_rate || 0;
        return aRate - bRate;
      }
      return 0;
    });

  const uniqueAreas = Array.from(new Set(providers.flatMap(p => p.service_areas)));
  const uniqueVehicleTypes = Array.from(new Set(providers.flatMap(p => p.vehicle_types)));

  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
        />
      );
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Providers
          </CardTitle>
          <CardDescription>
            Find trusted delivery providers for your construction materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger>
                <SelectValue placeholder="Service area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All areas</SelectItem>
                {uniqueAreas.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
              <SelectTrigger>
                <SelectValue placeholder="Vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All vehicles</SelectItem>
                {uniqueVehicleTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Sort by Rating</SelectItem>
                <SelectItem value="total_deliveries">Sort by Experience</SelectItem>
                <SelectItem value="hourly_rate">Sort by Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
        </p>
        {(searchTerm || selectedArea || selectedVehicleType) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedArea('');
              setSelectedVehicleType('');
            }}
          >
            <Filter className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No providers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new providers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {provider.provider_type === 'individual' ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                      <span className="truncate">{provider.provider_name}</span>
                    </CardTitle>
                    {provider.contact_person && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Contact: {provider.contact_person}
                      </p>
                    )}
                  </div>
                  {provider.is_verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  {renderRating(provider.rating)}
                  <span className="text-sm text-muted-foreground">
                    {provider.total_deliveries} deliveries
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {provider.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{provider.address}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{provider.phone}</span>
                </div>
                
                {provider.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{provider.email}</span>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium mb-2">Vehicle Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.vehicle_types.slice(0, 3).map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {provider.vehicle_types.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.vehicle_types.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Service Areas:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.service_areas.slice(0, 3).map((area) => (
                      <Badge key={area} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                    {provider.service_areas.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.service_areas.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  {provider.capacity_kg && (
                    <span>Capacity: {provider.capacity_kg}kg</span>
                  )}
                  {provider.hourly_rate && (
                    <span>KES {provider.hourly_rate}/hr</span>
                  )}
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => onProviderSelect?.(provider)}
                >
                  Contact Provider
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryProvidersList;