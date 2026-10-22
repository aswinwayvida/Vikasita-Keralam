import officialLotus from "@/assets/bjp-official-lotus.png";

interface LotusLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  className?: string;
}

export function LotusLoader({
  size = "md",
  label,
  className = "",
}: LotusLoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-20 w-24",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Glowing pulsing background ring */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75" />
        
        {/* Animated Lotus Logo */}
        <img
          src={officialLotus}
          alt="Loading..."
          className={`${sizeClasses[size]} relative z-10 animate-pulse object-contain drop-shadow-md`}
        />
      </div>

      {label && (
        <span className="text-xs sm:text-sm font-semibold text-muted-foreground animate-pulse font-display tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
}
