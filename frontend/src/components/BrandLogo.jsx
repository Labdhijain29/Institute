import React from "react";
import brandLogo from "../assets/brand/coding-wallah-full.png";
import brandIcon from "../assets/brand/coding-wallah-icon.png";

export { brandLogo, brandIcon };

export function BrandLogo({ className = "h-14 w-auto", alt = "CODING WALLA From Learning to Earning logo", type = "full" }) {
  const logo = type === "icon" ? brandIcon : brandLogo;
  return (
    <img
      src={logo}
      alt={alt}
      className={`${className} shrink-0 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)]`}
    />
  );
}

export function BrandLockup({
  logoClassName = "h-14 w-auto",
  className = "",
  textClassName = "",
  variant = "dark",
  type = "lockup"
}) {
  if (type !== "lockup") {
    return <BrandLogo className={logoClassName} type={type} />;
  }

  const isLight = variant === "light";
  const codingClass = isLight ? "text-[#111315]" : "text-white";
  const taglineClass = isLight ? "text-slate-600" : "text-white/80";

  return (
    <span className={`inline-flex min-w-0 items-center gap-3 ${className}`}>
      <img
        src={brandIcon}
        alt=""
        aria-hidden="true"
        className={`${logoClassName} shrink-0 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)]`}
      />
      <span className={`min-w-0 leading-none ${textClassName}`}>
        <span className="block whitespace-nowrap text-[19px] font-black tracking-normal">
          <span className={codingClass}>CODING</span>
          <span className="text-[#F7931E]"> WALLA</span>
        </span>
        <span className={`mt-1 block whitespace-nowrap text-[12px] font-bold tracking-normal ${taglineClass}`}>
          From Learning to Earning
        </span>
      </span>
    </span>
  );
}
