import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Truck, User, Building2, Menu } from "lucide-react";

interface DeliveryMenuBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userProfile: any;
}

const DeliveryMenuBar = ({ activeTab, onTabChange, userProfile }: DeliveryMenuBarProps) => {
  const menuItems = [
    {
      id: 'providers',
      label: 'Delivery Providers',
      icon: Truck,
      description: 'Browse available delivery services'
    },
    {
      id: 'builder-requests',
      label: 'Delivery Request',
      icon: Building2,
      description: 'Submit delivery requests',
      requiresAuth: true,
      allowedRoles: ['builder']
    },
    {
      id: 'apply',
      label: 'Apply as Delivery',
      icon: User,
      description: 'Register as delivery provider',
      requiresAuth: true
    }
  ];

  const canAccessMenuItem = (item: any) => {
    if (!item.requiresAuth) return true;
    if (!userProfile) return false;
    if (item.allowedRoles && !item.allowedRoles.includes(userProfile.role)) return false;
    return true;
  };

  return (
    <div className="space-y-4">
      {/* Desktop Menu Bar */}
      <div className="hidden md:block">
        <Menubar className="w-full h-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const canAccess = canAccessMenuItem(item);
            
            if (!canAccess) return null;
            
            return (
              <MenubarMenu key={item.id}>
                <MenubarTrigger 
                  className={`flex-1 px-6 py-4 flex flex-col items-center gap-2 min-h-[80px] cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium text-center leading-tight">
                    {item.label}
                  </span>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem 
                    onClick={() => onTabChange(item.id)}
                    className="cursor-pointer"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.description}
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            );
          })}
        </Menubar>
      </div>

      {/* Mobile Menu Bar */}
      <div className="md:hidden">
        <div className="flex flex-col space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const canAccess = canAccessMenuItem(item);
            
            if (!canAccess) return null;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "outline"}
                onClick={() => onTabChange(item.id)}
                className={`w-full h-auto py-4 px-4 flex items-center justify-start gap-3 transition-all duration-200 ${
                  isActive ? 'shadow-md' : ''
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex flex-col items-start text-left flex-1">
                  <span className="font-medium text-sm">
                    {item.label}
                  </span>
                  <span className={`text-xs opacity-75 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                    {item.description}
                  </span>
                </div>
                {isActive && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    Active
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Authentication Notice for Mobile */}
      {!userProfile && (
        <div className="md:hidden">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <User className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Sign in to access delivery requests and provider registration
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMenuBar;