"use client";

import { Baby, Droplet, Heart, Shirt, Star, type LucideIcon } from "lucide-react";

const palette = {
  blue: "#4FA9D1",
  pink: "#D4537E",
  teal: "#5DCAA5",
  amber: "#EF9F27",
  purple: "#7F77DD",
  coral: "#F0997B",
};

type ShapeType = "icon" | "blob";

interface ShapeConfig {
  type: ShapeType;
  icon?: LucideIcon;
  color: string;
  sizeRem: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  opacity: number;
  rotate?: number;
  blur?: boolean;
  hideOnMobile?: boolean;
}

const PRESETS: Record<string, ShapeConfig[]> = {
  "home-banner": [
    {
      type: "blob",
      color: palette.blue,
      sizeRem: 16,
      top: "-18%",
      right: "-8%",
      opacity: 0.09,
      blur: true,
    },
    {
      type: "icon",
      icon: Star,
      color: palette.amber,
      sizeRem: 8,
      bottom: "12%",
      left: "4%",
      opacity: 0.08,
      rotate: -12,
    },
    {
      type: "icon",
      icon: Heart,
      color: palette.pink,
      sizeRem: 6,
      top: "18%",
      right: "22%",
      opacity: 0.08,
      rotate: 15,
      hideOnMobile: true,
    },
  ],
  "home-categories": [
    {
      type: "blob",
      color: palette.purple,
      sizeRem: 14,
      top: "-10%",
      left: "-6%",
      opacity: 0.08,
      blur: true,
    },
    {
      type: "icon",
      icon: Droplet,
      color: palette.coral,
      sizeRem: 7,
      bottom: "10%",
      right: "6%",
      opacity: 0.07,
      rotate: 20,
    },
    {
      type: "icon",
      icon: Baby,
      color: palette.blue,
      sizeRem: 6,
      top: "20%",
      right: "18%",
      opacity: 0.06,
      rotate: -8,
      hideOnMobile: true,
    },
  ],
  "home-products": [
    {
      type: "blob",
      color: palette.coral,
      sizeRem: 16,
      bottom: "-12%",
      left: "-8%",
      opacity: 0.07,
      blur: true,
    },
    {
      type: "icon",
      icon: Star,
      color: palette.teal,
      sizeRem: 8,
      top: "8%",
      right: "5%",
      opacity: 0.06,
      rotate: 18,
    },
    {
      type: "icon",
      icon: Shirt,
      color: palette.purple,
      sizeRem: 7,
      top: "35%",
      left: "3%",
      opacity: 0.07,
      rotate: -15,
    },
  ],
  category: [
    {
      type: "blob",
      color: palette.blue,
      sizeRem: 14,
      top: "-8%",
      right: "-6%",
      opacity: 0.08,
      blur: true,
    },
    {
      type: "icon",
      icon: Heart,
      color: palette.pink,
      sizeRem: 7,
      bottom: "8%",
      left: "4%",
      opacity: 0.06,
      rotate: 12,
      hideOnMobile: true,
    },
  ],
  product: [
    {
      type: "blob",
      color: palette.teal,
      sizeRem: 14,
      top: "-6%",
      left: "-8%",
      opacity: 0.08,
      blur: true,
    },
    {
      type: "icon",
      icon: Star,
      color: palette.amber,
      sizeRem: 7,
      bottom: "12%",
      right: "5%",
      opacity: 0.06,
      rotate: -10,
    },
  ],
};

function DecorativeShape({ shape }: { shape: ShapeConfig }) {
  const commonClasses = `pointer-events-none absolute select-none ${shape.hideOnMobile ? "hidden sm:block" : ""}`;
  const sizePx = shape.sizeRem * 16;

  if (shape.type === "blob") {
    return (
      <span
        aria-hidden="true"
        className={`${commonClasses} ${shape.blur ? "blur-3xl" : "rounded-full"}`}
        style={{
          top: shape.top,
          bottom: shape.bottom,
          left: shape.left,
          right: shape.right,
          width: sizePx,
          height: sizePx,
          backgroundColor: shape.color,
          opacity: shape.opacity,
          transform: `rotate(${shape.rotate ?? 0}deg)`,
        }}
      />
    );
  }

  const Icon = shape.icon;
  if (!Icon) return null;

  return (
    <span
      aria-hidden="true"
      className={commonClasses}
      style={{
        top: shape.top,
        bottom: shape.bottom,
        left: shape.left,
        right: shape.right,
        opacity: shape.opacity,
        transform: `rotate(${shape.rotate ?? 0}deg)`,
      }}
    >
      <Icon
        className="block"
        strokeWidth={1}
        style={{ width: sizePx, height: sizePx, color: shape.color }}
      />
    </span>
  );
}

export function PlayfulDecor({ preset }: { preset: keyof typeof PRESETS }) {
  const shapes = PRESETS[preset] ?? [];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {shapes.map((shape, index) => (
        <DecorativeShape key={`${preset}-${index}`} shape={shape} />
      ))}
    </div>
  );
}
