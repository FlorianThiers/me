import type { LucideIcon } from 'lucide-react';
import {
  Globe,
  Instagram,
  Sparkles,
  Github,
  Mail,
  Droplets,
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
  // TODO: add URL when ready
  { label: 'Vijverkuis', url: null, icon: Droplets },
  // TODO: add URL when ready
  { label: 'Corridor', url: null, icon: Route },
  // TODO: add URL when ready
  { label: 'YouTube', url: null, icon: Youtube },
  // TODO: add URL when ready — X (formerly Twitter)
  { label: 'X', url: null, icon: Globe },
  // TODO: add URL when ready
  { label: 'Facebook', url: null, icon: Facebook },
] as const;

/** Items with a non-empty URL, in config order. */
export function getVisibleBioLinks(items: readonly BioLinkItem[] = BIO_LINK_ITEMS): BioLinkItem[] {
  return items.filter((item) => typeof item.url === 'string' && item.url.trim().length > 0);
}

export function isExternalBioLink(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
