// Files: src/sections/auth/atoms/BrandLogo.tsx

import Image from "next/image";

interface BrandProps {
  compact?: boolean;
}

export default function BrandLogo({ compact = false }: BrandProps) {
  return (
    <div
      className={
        compact ? "relative h-14 w-14 shrink-0" : "relative h-24 w-60 shrink-0"
      }
    >
      <Image
        alt="Logo Kebun Matematika"
        className="object-contain object-left"
        fill
        priority
        sizes={compact ? "56px" : "240px"}
        src={
          compact
            ? "/assets/images/logo/logo.png"
            : "/assets/images/logo/kebun-matematika-logo.png"
        }
      />
    </div>
  );
}
