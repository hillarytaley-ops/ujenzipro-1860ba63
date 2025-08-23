import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingCart, Building2, Package } from "lucide-react";

interface Builder {
  id: string;
  name: string;
  location: string;
  type: "Company" | "Individual";
  projectsActive: number;
  materialsNeeded: string[];
  budget: string;
  image: string;
}

interface BuilderCardProps {
  builder: Builder;
  onContact: (builderId: string) => void;
}

export const BuilderCard = ({ builder, onContact }: BuilderCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <CardHeader className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
          <img 
            src={builder.image} 
            alt={`${builder.name} profile`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <CardTitle className="text-lg">{builder.name}</CardTitle>
        <CardDescription className="flex items-center justify-center gap-1">
          <MapPin className="h-4 w-4" />
          {builder.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center gap-1">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">{builder.type}</span>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            {builder.projectsActive} active projects
          </div>
        </div>
        
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Materials Needed:</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {builder.materialsNeeded.map((material, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {material}
              </Badge>
            ))}
          </div>
        </div>
        
        <Badge variant="outline" className="text-sm">
          Budget: {builder.budget}
        </Badge>
        
        <Button 
          className="w-full" 
          onClick={() => onContact(builder.id)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Contact Buyer
        </Button>
      </CardContent>
    </Card>
  );
};