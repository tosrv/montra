import React from 'react';
import {
  Wallet,
  Briefcase,
  TrendingUp,
  CircleDot,
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  GraduationCap,
  Film,
  HeartPulse,
  Home,
  Coffee,
  Gift,
  Plane,
  CreditCard,
  PiggyBank,
  Smile,
  Shield,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  className?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wallet,
  Briefcase,
  TrendingUp,
  CircleDot,
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  GraduationCap,
  Film,
  HeartPulse,
  Home,
  Coffee,
  Gift,
  Plane,
  CreditCard,
  PiggyBank,
  Smile,
  Shield,
  Zap,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export function CategoryIcon({ name, className = 'w-5 h-5' }: CategoryIconProps) {
  const IconComponent = (name && ICON_MAP[name]) || CircleDot || HelpCircle;
  return <IconComponent className={className} />;
}
