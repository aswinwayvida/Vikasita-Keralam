import React from "react";

interface PartyFlagIconProps {
  className?: string;
}

export function PartyFlagIcon({ className = "h-3.5 w-5" }: PartyFlagIconProps) {
  return (
    <img
      src="/images/bjp_flag_badge.png"
      alt="BJP Flag Badge"
      className={`${className} inline-block object-contain shrink-0 shadow-2xs rounded-[2px] select-none`}
      title="BJP Member & Political Representative Flag"
    />
  );
}

export function BjpFlagBadge({ className = "h-3.5 w-5" }: PartyFlagIconProps) {
  return (
    <img
      src="/images/bjp_flag_badge.png"
      alt="BJP Badge"
      className={`${className} inline-block object-contain shrink-0 shadow-2xs rounded-[2px] select-none`}
      title="BJP Member Badge"
    />
  );
}
