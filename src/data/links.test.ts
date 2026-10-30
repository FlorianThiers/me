import { describe, expect, it } from 'vitest';
import { BIO_LINK_ITEMS, getVisibleBioLinks, type BioLinkItem } from './links';

describe('getVisibleBioLinks', () => {
  it('hides items with null or empty urls', () => {
    const items: BioLinkItem[] = [
      { label: 'Shown', url: 'https://example.com', icon: BIO_LINK_ITEMS[0].icon },
      { label: 'Null', url: null, icon: BIO_LINK_ITEMS[0].icon },
      { label: 'Empty', url: '   ', icon: BIO_LINK_ITEMS[0].icon },
    ];

    expect(getVisibleBioLinks(items).map((i) => i.label)).toEqual(['Shown']);
  });

  it('keeps only configured links that have urls', () => {
    const visible = getVisibleBioLinks(BIO_LINK_ITEMS);
    const labels = visible.map((i) => i.label);

    expect(labels).toEqual([
      'Website',
      'Instagram',
      'Urban Culture',
      'GitHub',
      'Contact',
      'Vijverkuis',
      'Anaconda',
      'WaterSafe',
      'Corridor',
      'YouTube',
      'X',
      'Facebook',
    ]);
    expect(visible.every((i) => i.url !== null && i.url.trim().length > 0)).toBe(true);
  });
});
