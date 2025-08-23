interface StatItemProps {
  value: string;
  label: string;
  colorClass: string;
}

const StatItem = ({ value, label, colorClass }: StatItemProps) => (
  <div className="text-center animate-fade-in">
    <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
    <div className="text-muted-foreground">{label}</div>
  </div>
);

export const BuilderStats = () => {
  const stats = [
    { value: "800+", label: "Active Buyers", colorClass: "text-foreground" },
    { value: "2,500+", label: "Material Orders", colorClass: "text-construction-orange" },
    { value: "47", label: "Counties Covered", colorClass: "text-primary" },
    { value: "Ksh 50M+", label: "Monthly Volume", colorClass: "text-foreground" }
  ];

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatItem 
              key={index}
              value={stat.value}
              label={stat.label}
              colorClass={stat.colorClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
};