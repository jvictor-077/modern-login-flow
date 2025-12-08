import sportsHero from "@/assets/sports-hero.jpg";

const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Hero image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={sportsHero} 
          alt="Quadra de esportes" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>
      
      {/* Main glow */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      {/* Floating sport elements */}
      <div 
        className="absolute top-20 right-20 w-20 h-20 rounded-full border-2 border-primary/30 animate-float flex items-center justify-center"
        style={{ animationDelay: "0s" }}
      >
        <span className="text-3xl">🏐</span>
      </div>
      <div 
        className="absolute bottom-32 left-20 w-16 h-16 rounded-full border-2 border-accent/30 animate-float flex items-center justify-center"
        style={{ animationDelay: "2s" }}
      >
        <span className="text-2xl">🎾</span>
      </div>
      <div 
        className="absolute top-1/2 right-32 w-14 h-14 rounded-full border-2 border-primary/20 animate-float flex items-center justify-center"
        style={{ animationDelay: "4s" }}
      >
        <span className="text-xl">🏸</span>
      </div>
      
      {/* Net pattern decoration */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, hsl(var(--primary)) 40px, hsl(var(--primary)) 41px), 
                           repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(var(--primary)) 40px, hsl(var(--primary)) 41px)`,
        }}
      />
    </div>
  );
};

export default FloatingShapes;
