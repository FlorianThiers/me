import type { LucideIcon } from 'lucide-react';
import {
  Globe,
  Instagram,
  Sparkles,
  Github,
  Mail,
  Droplets,
  Fish,
  ShieldCheck,
  Route,
  Youtube,
  Facebook,
} from 'lucide-react';

/** Single source of truth for the /links bio page. */
export type BioLinkItem = {
  label: string;
  url: string | null;
  icon: LucideIcon;
};

export const BIO_LINK_ITEMS: readonly BioLinkItem[] = [
  { label: 'Website', url: '/', icon: Globe },
  { label: 'Instagram', url: 'https://www.instagram.com/florian_thiers/', icon: Instagram },
  { label: 'Urban Culture', url: 'https://urban-culture-connect.com/', icon: Sparkles },
  { label: 'GitHub', url: 'https://github.com/FlorianThiers', icon: Github },
  { label: 'Contact', url: '/#contact', icon: Mail },
  { label: 'Vijverkuis', url: 'https://vijverkuis.com/', icon: Droplets },
  { label: 'Anaconda', url: 'https://www.anaconda-pondcleaners.com/nl', icon: Fish },
  { label: 'WaterSafe', url: 'https://watersafe-iota.vercel.app/', icon: ShieldCheck },
  { label: 'Corridor', url: 'https://corridor.gent/', icon: Route },
  { label: 'YouTube', url: 'https://www.youtube.com/@florianthiers', icon: Youtube },
  { label: 'X', url: 'https://x.com/ThiersFlorian', icon: Globe },
  { label: 'Facebook', url: 'https://www.facebook.com/florian.thiers.7', icon: Facebook },
] as const;

/** Items with a non-empty URL, in config order. */
export function getVisibleBioLinks(items: readonly BioLinkItem[] = BIO_LINK_ITEMS): BioLinkItem[] {
  return items.filter((item) => typeof item.url === 'string' && item.url.trim().length > 0);
}

export function isExternalBioLink(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
