"use client";

import { useState } from "react";

interface Props {
  src?: string | null;
  alt: string;
  size?: number; // px, default 48
  fallback?: string; // emoji fallback
}

export default function AvatarImg({ src, alt, size = 48, fallback = "🏢" }: Props) {
  const [error, setError] = useState(false);

  const cls = `rounded-full object-cover border border-border`;
  const dim = `w-[${size}px] h-[${size}px]`;

  if (src && !error) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
        className={`${cls} object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-primary/10 flex items-center justify-center"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {fallback}
    </div>
  );
}
