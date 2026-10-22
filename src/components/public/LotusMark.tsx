import officialLotus from "@/assets/bjp-official-lotus.png";
import { cn } from "@/lib/utils";

type LotusMarkProps = {
  size?: number;
  shape?: "square" | "circle";
  className?: string;
};

export function LotusMark({ size = 36, shape = "square", className }: LotusMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-white shadow-sm",
        shape === "circle" ? "rounded-full" : "rounded-xl",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src={officialLotus}
        alt=""
        className="h-full w-full object-contain"
        decoding="async"
      />
    </span>
  );
}
