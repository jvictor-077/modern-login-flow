const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      
      {/* Floating orbs */}
      <div 
        className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div 
        className="absolute bottom-32 right-32 w-24 h-24 rounded-full bg-gradient-to-br from-primary/15 to-transparent animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div 
        className="absolute top-1/2 left-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-transparent animate-float"
        style={{ animationDelay: "4s" }}
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Gradient lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
    </div>
  );
};

export default FloatingShapes;
