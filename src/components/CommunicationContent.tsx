import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Users, Truck, Building2, User } from 'lucide-react';
import DeliveryCommunicationHub from '@/components/DeliveryCommunicationHub';
import CommunicationInterface from '@/components/CommunicationInterface';

export const CommunicationContent: React.FC = () => {
  const [userType, setUserType] = useState<'supplier' | 'delivery_provider' | 'builder'>('builder');
  const [userId, setUserId] = useState('demo-user-1');
  const [userName, setUserName] = useState('Demo User');
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSetup = () => {
    if (userId && userName && userType) {
      setIsConfigured(true);
    }
  };

  if (!isConfigured) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Communication Center</h2>
          <p className="text-muted-foreground">
            Set up your communication profile to start chatting with delivery stakeholders
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Setup Communication Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userType">Your Role</Label>
              <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="builder">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Builder
                    </div>
                  </SelectItem>
                  <SelectItem value="supplier">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Supplier
                    </div>
                  </SelectItem>
                  <SelectItem value="delivery_provider">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery Provider
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <Label htmlFor="userId">User ID (Demo)</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter a unique user ID"
              />
              <p className="text-sm text-muted-foreground mt-1">
                In a real app, this would be your authenticated user ID
              </p>
            </div>

            <Button 
              onClick={handleSetup} 
              className="w-full"
              disabled={!userId || !userName}
            >
              Start Communication
            </Button>
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Real-time Chat</h3>
              <p className="text-sm text-muted-foreground">
                Instant messaging between all delivery stakeholders
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Live Status Updates</h3>
              <p className="text-sm text-muted-foreground">
                Track delivery progress with real-time status updates
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Location Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share current location for better coordination
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Delivery Communication Hub</h3>
          <DeliveryCommunicationHub
            deliveryRequestId="demo-request-1"
            currentUserType={userType}
            currentUserId={userId}
            currentUserName={userName}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Communication Interface</h3>
          <CommunicationInterface
            userType={userType}
            userId={userId}
            userName={userName}
          />
        </div>
      </div>
    </div>
  );
};