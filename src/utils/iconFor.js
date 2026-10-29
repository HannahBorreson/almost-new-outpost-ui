// Maps a product's iconKey (stored in the database) to a lucide-react icon.
import {
  Backpack,
  Bandage,
  BatteryFull,
  BedDouble,
  Binoculars,
  BriefcaseMedical,
  Compass,
  CookingPot,
  Droplets,
  Filter,
  Flame,
  Flashlight,
  Package,
  Pill,
  Sandwich,
  Shield,
  Shirt,
  Syringe,
  Zap,
} from 'lucide-react'

export const productIcons = {
  water: Droplets,
  ration: Sandwich,
  flashlight: Flashlight,
  battery: BatteryFull,
  blanket: BedDouble,
  cooking: CookingPot,
  compass: Compass,
  binoculars: Binoculars,
  filter: Filter,
  backpack: Backpack,
  'first-aid': BriefcaseMedical,
  'medical-kit': Syringe,
  bandage: Bandage,
  pills: Pill,
  baton: Zap,
  shield: Shield,
  vest: Shirt,
  flare: Flame,
}

// Used by the admin form's icon dropdown.
export const iconKeys = Object.keys(productIcons)

export function iconFor(iconKey) {
  return productIcons[iconKey] || Package
}
