"use client";

import { Baby, Droplet, Heart, Star, type LucideIcon } from "lucide-react";

const palette = {
  blue: "#4FA9D1",
  pink: "#D4537E",
  teal: "#5DCAA5",
  amber: "#EF9F27",
  purple: "#7F77DD",
  coral: "#F0997B",
};

const OPACITY = 0.18;

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
  rotate?: number;
  blur?: boolean;
  hideOnMobile?: boolean;
}

const PRESETS: Record<string, ShapeConfig[]> = {
  // Home: sparse corner decorations in the page margins around the centered content column
  home: [
    {
      type: "blob",
      color: palette.coral,
      sizeRem: 8,
      bottom: "5rem",
      right: "1rem",
      blur: true,
      hideOnMobile: true,
    },
    {
      type: "icon",
      icon: Star,
      color: palette.amber,
      sizeRem: 6,
      top: "8rem",
      right: "3rem",
      rotate: 15,
      hideOnMobile: true,
    },
  ],
  // Category and Product pages are dense grids/details; no decor so shapes aren't buried behind content
  category: [],
  product: [],
  // Cart/Checkout: single subtle blob in a corner margin, away from forms and lists
  cart: [
    {
      type: "blob",
      color: palette.coral,
      sizeRem: 7,
      top: "5rem",
      right: "1rem",
      blur: true,
      hideOnMobile: true,
    },
  ],
  checkout: [
    {
      type: "blob",
      color: palette.blue,
      sizeRem: 7,
      top: "5rem",
      left: "1rem",
      blur: true,
      hideOnMobile: true,
    },
  ],
  // Checkout success: sparse centered card, one icon in a corner
  "checkout-success": [
    {
      type: "icon",
      icon: Star,
      color: palette.amber,
      sizeRem: 7,
      top: "6rem",
      right: "2rem",
      rotate: 15,
      hideOnMobile: true,
    },
  ],
  // Account pages: sparse forms/lists, one blob + one icon in opposite corners
  login: [
    {
      type: "blob",
      color: palette.purple,
      sizeRem: 7,
      top: "5rem",
      left: "1rem",
      blur: true,
      hideOnMobile: true,
    },
    {
      type: "icon",
      icon: Heart,
      color: palette.pink,
      sizeRem: 5,
      bottom: "4rem",
      right: "2rem",
      rotate: -10,
      hideOnMobile: true,
    },
  ],
  signup: [
    {
      type: "blob",
      color: palette.teal,
      sizeRem: 7,
      top: "5rem",
      right: "1rem",
      blur: true,
      hideOnMobile: true,
    },
    {
      type: "icon",
      icon: Baby,
      color: palette.amber,
      sizeRem: 5,
      bottom: "4rem",
      left: "2rem",
      rotate: 8,
      hideOnMobile: true,
    },
  ],
  orders: [
    {
      type: "blob",
      color: palette.pink,
      sizeRem: 7,
      top: "5rem",
      right: "1rem",
      blur: true,
      hideOnMobile: true,
    },
    {
      type: "icon",
      icon: Droplet,
      color: palette.blue,
      sizeRem: 5,
      bottom: "4rem",
      left: "2rem",
      rotate: -5,
      hideOnMobile: true,
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
        className={`${commonClasses} rounded-full blur-3xl`}
        style={{
          top: shape.top,
          bottom: shape.bottom,
          left: shape.left,
          right: shape.right,
          width: sizePx,
          height: sizePx,
          backgroundColor: shape.color,
          opacity: OPACITY,
          borderRadius: "50%",
          filter: "blur(40px)",
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
        opacity: OPACITY,
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
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {shapes.map((shape, index) => (
        <DecorativeShape key={`${preset}-${index}`} shape={shape} />
      ))}
    </div>
  );
}
