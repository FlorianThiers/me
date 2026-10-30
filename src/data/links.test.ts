import { describe, expect, it } from 'vitest';
import {
  BIO_LINK_ITEMS,
  getVisibleBioLinkSections,
  getVisibleBioLinks,
  type BioLinkItem,
} from './links';

describe('getVisibleBioLinks', () => {
  it('hides items with null or empty urls', () => {
    const items: BioLinkItem[] = [
      { label: 'Shown', url: 'https://example.com', icon: BIO_LINK_ITEMS[0].icon, group: 'primary' },
      { label: 'Null', url: null, icon: BIO_LINK_ITEMS[0].icon, group: 'primary' },
      { label: 'Empty', url: '   ', icon: BIO_LINK_ITEMS[0].icon, group: 'socials' },
    ];

    expect(getVisibleBioLinks(items).map((i) => i.label)).toEqual(['Shown']);
  });
});

describe('getVisibleBioLinkSections', () => {
  it('groups visible links in site order with headings', () => {
    const sections = getVisibleBioLinkSections(BIO_LINK_ITEMS);

    expect(sections.map((s) => s.heading)).toEqual([null, 'Socials', 'Projects', 'Work']);
    expect(sections.map((s) => s.items.map((i) => i.label))).toEqual([
      ['Website', 'Contact'],
      ['Instagram', 'YouTube', 'X', 'Facebook', 'GitHub'],
      ['Urban Culture', 'Corridor'],
      ['Vijverkuis', 'Anaconda', 'WaterSafe'],
    ]);
  });

  it('drops hidden null urls from their groups', () => {
    const items: BioLinkItem[] = [
      ...BIO_LINK_ITEMS.slice(0, 2),
      { ...BIO_LINK_ITEMS[2], url: null },
      ...BIO_LINK_ITEMS.slice(3),
    ];

    const socials = getVisibleBioLinkSections(items).find((s) => s.id === 'socials');
    expect(socials?.items.map((i) => i.label)).not.toContain('Instagram');
    expect(socials?.items[0]?.label).toBe('YouTube');
  });
});
