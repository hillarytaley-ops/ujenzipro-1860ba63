import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  Globe
} from "lucide-react";
import { RateLimitService } from "@/lib/rateLimitService";
import { useOnlineStatus } from "@/components/OfflineDetector";

interface SystemMetrics {
  totalUsers: number;
  activeRequests: number;
  securityStatus: 'secure' | 'warning' | 'critical';
  uptime: string;
  performance: {
    responseTime: number;
    errorRate: number;
  };
}

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeRequests: 0,
    securityStatus: 'secure',
    uptime: '99.9%',
    performance: {
      responseTime: 120,
      errorRate: 0.01
    }
  });
  
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null);
  const isOnline = useOnlineStatus();
  
  useEffect(() => {
    // Simulate metrics fetching
    const fetchMetrics = () => {
      // In a real implementation, this would fetch from your analytics API
      setMetrics({
        totalUsers: Math.floor(Math.random() * 1000) + 500,
        activeRequests: Math.floor(Math.random() * 50) + 10,
        securityStatus: 'secure',
        uptime: '99.9%',
        performance: {
          responseTime: Math.floor(Math.random() * 50) + 100,
          errorRate: Math.random() * 0.05
        }
      });
      
      // Get rate limit status
      const rateLimitService = RateLimitService.getInstance();
      const status = rateLimitService.getRateLimitStatus();
      setRateLimitStatus(status);
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const clearRateLimits = () => {
    const rateLimitService = RateLimitService.getInstance();
    rateLimitService.clearRateLimit();
    setRateLimitStatus(null);
  };
  
  const getSecurityStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Active construction professionals
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Current API requests/min
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={getSecurityStatusColor(metrics.securityStatus)}>
                  {metrics.securityStatus.charAt(0).toUpperCase() + metrics.securityStatus.slice(1)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  All systems protected
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.uptime}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Row Level Security (RLS)</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Error Boundaries</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate Limiting</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Input Validation</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Authentication</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting Status</CardTitle>
              </CardHeader>
              <CardContent>
                {rateLimitStatus ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Requests Used:</span>
                      <span>{rateLimitStatus.count}/{rateLimitStatus.limit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span>{rateLimitStatus.remaining}</span>
                    </div>
                    <Button onClick={clearRateLimits} variant="outline" size="sm">
                      Clear Rate Limits
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No rate limit data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Database Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="font-semibold">{metrics.performance.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span className="font-semibold">{(metrics.performance.errorRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Hit Rate:</span>
                  <span className="font-semibold">94.2%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>PWA Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Service Worker</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Offline Support</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Web Manifest</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Push Notifications</span>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};