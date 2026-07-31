/**
 * Shared icon map for the concierge catalog. Used by both the catalog
 * grid (`/services/concierge`) and the detail page
 * (`/services/concierge/[slug]`) so a service's icon stays consistent
 * across both views.
 *
 * Most icons come from Lucide. `golf-cart` is a custom inline SVG since
 * Lucide doesn't ship one — see components/icons/GolfCartIcon.tsx.
 */
import {
  Plane,
  Car,
  Bike,
  Ship,
  Sailboat,
  ShoppingCart,
  Wine,
  ChefHat,
  Utensils,
  Cake,
  Trophy,
  Map as MapIcon,
  Camera,
  Music,
  Calendar,
  Ticket,
  Home,
  Sparkles,
  Flower,
  Gift,
  Heart,
  Baby,
  Users,
  Dog,
  ConciergeBell,
} from 'lucide-react'
import { GolfCartIcon } from '@/components/icons/GolfCartIcon'

export const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  plane: Plane,
  car: Car,
  'car-taxi': Car,
  bike: Bike,
  'golf-cart': GolfCartIcon,
  ship: Ship,
  sailboat: Sailboat,
  'shopping-cart': ShoppingCart,
  wine: Wine,
  'chef-hat': ChefHat,
  utensils: Utensils,
  cake: Cake,
  trophy: Trophy,
  map: MapIcon,
  camera: Camera,
  music: Music,
  calendar: Calendar,
  ticket: Ticket,
  home: Home,
  sparkles: Sparkles,
  flower: Flower,
  gift: Gift,
  heart: Heart,
  baby: Baby,
  users: Users,
  dog: Dog,
  'concierge-bell': ConciergeBell,
}
