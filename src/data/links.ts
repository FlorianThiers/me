import type { LucideIcon } from 'lucide-react';
import {
  Globe,
  Instagram,
  Github,
  Mail,
  Droplets,
  Fish,
  ShieldCheck,
  Route,
  Youtube,
  Facebook,
} from 'lucide-react';
import { UrbanCultureIcon } from '../components/icons/UrbanCultureIcon';

export type BioLinkGroup = 'primary' | 'socials' | 'projects' | 'work';

export const BIO_LINK_GROUP_ORDER: readonly BioLinkGroup[] = [
  'primary',
  'socials',
  'projects',
  'work',
] as const;

export const BIO_LINK_GROUP_HEADINGS: Record<Exclude<BioLinkGroup, 'primary'>, string> = {
  socials: 'Socials',
  projects: 'Projects',
  work: 'Work',
};

/** Single source of truth for the /links bio page. */
export type BioLinkItem = {
  label: string;
  url: string | null;
  icon: LucideIcon;
  group: BioLinkGroup;
};

export const BIO_LINK_ITEMS: readonly BioLinkItem[] = [
  { label: 'Website', url: '/', icon: Globe, group: 'primary' },
  { label: 'Contact', url: '/#contact', icon: Mail, group: 'primary' },
  { label: 'Instagram', url: 'https://www.instagram.com/florian_thiers/', icon: Instagram, group: 'socials' },
  { label: 'YouTube', url: 'https://www.youtube.com/@florianthiers', icon: Youtube, group: 'socials' },
  { label: 'X', url: 'https://x.com/ThiersFlorian', icon: Globe, group: 'socials' },
  { label: 'Facebook', url: 'https://www.facebook.com/florian.thiers.7', icon: Facebook, group: 'socials' },
  { label: 'GitHub', url: 'https://github.com/FlorianThiers', icon: Github, group: 'socials' },
  { label: 'Urban Culture', url: 'https://urban-culture-connect.com/', icon: UrbanCultureIcon, group: 'projects' },
  { label: 'Corridor', url: 'https://corridor.gent/', icon: Route, group: 'projects' },
  { label: 'Vijverkuis', url: 'https://vijverkuis.com/', icon: Droplets, group: 'work' },
  { label: 'Anaconda', url: 'https://www.anaconda-pondcleaners.com/nl', icon: Fish, group: 'work' },
  { label: 'WaterSafe', url: 'https://watersafe-iota.vercel.app/', icon: ShieldCheck, group: 'work' },
] as const;

export type BioLinkSection = {
  id: BioLinkGroup;
  heading: string | null;
  items: BioLinkItem[];
};

function isVisibleUrl(url: string | null): url is string {
  return typeof url === 'string' && url.trim().length > 0;
}

/** Items with a non-empty URL, in config order. */
export function getVisibleBioLinks(items: readonly BioLinkItem[] = BIO_LINK_ITEMS): BioLinkItem[] {
  return items.filter((item) => isVisibleUrl(item.url));
}

/** Visible links grouped for /links rendering order. */
export function getVisibleBioLinkSections(items: readonly BioLinkItem[] = BIO_LINK_ITEMS): BioLinkSection[] {
  return BIO_LINK_GROUP_ORDER.flatMap((groupId) => {
    const sectionItems = items.filter((item) => item.group === groupId && isVisibleUrl(item.url));
    if (sectionItems.length === 0) return [];

    const heading =
      groupId === 'primary' ? null : BIO_LINK_GROUP_HEADINGS[groupId as Exclude<BioLinkGroup, 'primary'>];

    return [{ id: groupId, heading, items: sectionItems }];
  });
}

export function isExternalBioLink(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
