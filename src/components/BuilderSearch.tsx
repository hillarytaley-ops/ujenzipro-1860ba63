import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface BuilderSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  budgetFilter: string;
  onBudgetFilterChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const locations = [
  "All Locations", "Nairobi", "Kisumu", "Mombasa", "Nakuru", "Eldoret", "Meru"
];

const budgetRanges = [
  "All Budgets", 
  "Under Ksh 500K", 
  "Ksh 500K - 1M", 
  "Ksh 1M - 3M", 
  "Ksh 3M - 5M", 
  "Above Ksh 5M"
];

export const BuilderSearch = ({
  searchTerm,
  onSearchChange,
  locationFilter,
  onLocationFilterChange,
  typeFilter,
  onTypeFilterChange,
  budgetFilter,
  onBudgetFilterChange,
  onClearFilters,
  hasActiveFilters
}: BuilderSearchProps) => {
  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="max-w-2xl mx-auto flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search buyers by name, location, or materials needed..." 
            className="pl-10 py-6 text-lg"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button size="lg" className="px-8">
          Search
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters:</span>
        </div>
        
        <Select value={locationFilter} onValueChange={onLocationFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Builder type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Types">All Types</SelectItem>
            <SelectItem value="Company">Company</SelectItem>
            <SelectItem value="Individual">Individual</SelectItem>
          </SelectContent>
        </Select>

        <Select value={budgetFilter} onValueChange={onBudgetFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Budget range" />
          </SelectTrigger>
          <SelectContent>
            {budgetRanges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};