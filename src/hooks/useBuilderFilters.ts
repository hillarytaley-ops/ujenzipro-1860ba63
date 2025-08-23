import { useState, useMemo } from "react";

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

export const useBuilderFilters = (builders: Builder[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [budgetFilter, setBudgetFilter] = useState("All Budgets");

  const filteredBuilders = useMemo(() => {
    return builders.filter((builder) => {
      // Search term filter
      const matchesSearch = 
        builder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        builder.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        builder.materialsNeeded.some(material => 
          material.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Location filter
      const matchesLocation = 
        locationFilter === "All Locations" || builder.location === locationFilter;

      // Type filter
      const matchesType = 
        typeFilter === "All Types" || builder.type === typeFilter;

      // Budget filter
      const matchesBudget = budgetFilter === "All Budgets" || 
        checkBudgetMatch(builder.budget, budgetFilter);

      return matchesSearch && matchesLocation && matchesType && matchesBudget;
    });
  }, [builders, searchTerm, locationFilter, typeFilter, budgetFilter]);

  const checkBudgetMatch = (builderBudget: string, filterBudget: string): boolean => {
    const budgetValue = extractBudgetValue(builderBudget);
    
    switch (filterBudget) {
      case "Under Ksh 500K":
        return budgetValue < 500000;
      case "Ksh 500K - 1M":
        return budgetValue >= 500000 && budgetValue <= 1000000;
      case "Ksh 1M - 3M":
        return budgetValue >= 1000000 && budgetValue <= 3000000;
      case "Ksh 3M - 5M":
        return budgetValue >= 3000000 && budgetValue <= 5000000;
      case "Above Ksh 5M":
        return budgetValue > 5000000;
      default:
        return true;
    }
  };

  const extractBudgetValue = (budget: string): number => {
    // Extract the upper value from budget range for comparison
    const matches = budget.match(/(\d+(?:\.\d+)?)[KM]/g);
    if (!matches) return 0;
    
    const values = matches.map(match => {
      const num = parseFloat(match.replace(/[KM]/, ''));
      return match.includes('M') ? num * 1000000 : num * 1000;
    });
    
    return Math.max(...values);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("All Locations");
    setTypeFilter("All Types");
    setBudgetFilter("All Budgets");
  };

  const hasActiveFilters = 
    searchTerm !== "" || 
    locationFilter !== "All Locations" || 
    typeFilter !== "All Types" || 
    budgetFilter !== "All Budgets";

  return {
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
  };
};