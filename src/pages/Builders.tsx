
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ReceiptPortal from "@/components/ReceiptPortal";
import { BuilderCard } from "@/components/BuilderCard";
import { BuilderHero } from "@/components/BuilderHero";
import { BuilderStats } from "@/components/BuilderStats";
import { BuilderCTA } from "@/components/BuilderCTA";
import { useBuilderFilters } from "@/hooks/useBuilderFilters";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Import builder images
import kamauConstructionImg from "@/assets/kamau-construction.jpg";
import johnMwangiImg from "@/assets/john-mwangi.jpg";
import njeriConstructionImg from "@/assets/njeri-construction.jpg";
import peterOtienoImg from "@/assets/peter-otieno.jpg";
import graceWanjikuImg from "@/assets/grace-wanjiku.jpg";
import otienoContractorsImg from "@/assets/otieno-contractors.jpg";

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

const Builders = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user role:', profileError);
      } else {
        setUserRole(profileData?.role || null);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const builders: Builder[] = [
    {
      id: "1",
      name: "Kamau Construction Ltd",
      location: "Nairobi",
      type: "Company",
      projectsActive: 12,
      materialsNeeded: ["Cement", "Steel Bars", "Roofing Sheets"],
      budget: "Ksh 2M - 5M",
      image: kamauConstructionImg
    },
    {
      id: "2",
      name: "John Mwangi Construction",
      location: "Kisumu", 
      type: "Individual",
      projectsActive: 3,
      materialsNeeded: ["Bricks", "Sand", "Cement"],
      budget: "Ksh 500K - 1M",
      image: johnMwangiImg
    },
    {
      id: "3",
      name: "Njeri Development Co.",
      location: "Mombasa",
      type: "Company",
      projectsActive: 8,
      materialsNeeded: ["Concrete Blocks", "Paint", "Tiles"],
      budget: "Ksh 1M - 3M",
      image: njeriConstructionImg
    },
    {
      id: "4",
      name: "Peter Otieno Builder",
      location: "Nakuru",
      type: "Individual",
      projectsActive: 5,
      materialsNeeded: ["Iron Sheets", "Timber", "Nails"],
      budget: "Ksh 300K - 800K",
      image: peterOtienoImg
    },
    {
      id: "5",
      name: "Grace Wanjiku Constructions",
      location: "Eldoret",
      type: "Individual",
      projectsActive: 4,
      materialsNeeded: ["Doors", "Windows", "Hardware"],
      budget: "Ksh 600K - 1.2M",
      image: graceWanjikuImg
    },
    {
      id: "6",
      name: "Otieno Builders Ltd",
      location: "Meru",
      type: "Company",
      projectsActive: 15,
      materialsNeeded: ["Aggregates", "Steel", "Waterproofing"],
      budget: "Ksh 3M - 8M",
      image: otienoContractorsImg
    }
  ];

  const {
    searchTerm,
    setSearchTerm,
    locationFilter,
    setLocationFilter,
    typeFilter,
    setTypeFilter,
    budgetFilter,
    setBudgetFilter,
    filteredBuilders,
    clearFilters,
    hasActiveFilters
  } = useBuilderFilters(builders);

  const handleContactBuilder = (builderId: string) => {
    const builder = builders.find(b => b.id === builderId);
    if (builder) {
      toast({
        title: "Contact Request Sent",
        description: `We'll connect you with ${builder.name} shortly.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-construction flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-construction">
      <Navigation />

      {/* Hero Section with Search */}
      <BuilderHero
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        budgetFilter={budgetFilter}
        onBudgetFilterChange={setBudgetFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Stats Section */}
      <BuilderStats />

      {/* Builders Directory */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Active Material Buyers</h2>
              <p className="text-muted-foreground mt-2">
                Showing {filteredBuilders.length} of {builders.length} buyers
                {hasActiveFilters && " (filtered)"}
              </p>
            </div>
          </div>
          
          {filteredBuilders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                No builders found matching your criteria
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBuilders.map((builder) => (
                <BuilderCard
                  key={builder.id}
                  builder={builder}
                  onContact={handleContactBuilder}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <BuilderCTA />

      {/* Receipt Portal for Builders */}
      {userRole === 'builder' && (
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Material Receipts</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              View receipts and documentation shared by your suppliers
            </p>
            <ReceiptPortal userRole={userRole} />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Builders;
