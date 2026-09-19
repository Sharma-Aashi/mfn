import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject } from '@angular/core';
import { SiteSettingsService } from './site-settings.service';

/**
 * One entry per `[data-theme]` block in styles/_themes.scss. The swatches are
 * duplicated here only so the admin picker can preview a theme without
 * applying it; the storefront itself always reads the CSS variables.
 */
export interface ThemeOption {
  key: string;
  label: string;
  /** Primary actions. */
  accent: string;
  /** Discount badges, kept separate from the accent on purpose. */
  deal: string;
  /** The tinted page background. */
  surface: string;
  group: 'Reviewed' | 'Red replaced' | 'Other accents';
}

export const THEMES: ThemeOption[] = [
  { key: 'emerald', label: 'Emerald', accent: '#0c6b44', deal: '#c0392b', surface: '#f2f8f5', group: 'Reviewed' },
  { key: 'bronze', label: 'Bronze', accent: '#966817', deal: '#b3202b', surface: '#faf7f1', group: 'Reviewed' },
  { key: 'crimson', label: 'Crimson', accent: '#b3202b', deal: '#1a1a1a', surface: '#fdf5f4', group: 'Reviewed' },
  { key: 'forest', label: 'Forest', accent: '#1f3d24', deal: '#b4541f', surface: '#f6f8f5', group: 'Reviewed' },

  { key: 'emerald-orange', label: 'Emerald / Orange', accent: '#0c6b44', deal: '#c2410c', surface: '#f2f8f5', group: 'Red replaced' },
  { key: 'bronze-magenta', label: 'Bronze / Magenta', accent: '#966817', deal: '#be185d', surface: '#faf7f1', group: 'Red replaced' },
  { key: 'plum', label: 'Plum / Ink', accent: '#6d2a5f', deal: '#16181c', surface: '#faf5f9', group: 'Red replaced' },
  { key: 'rust', label: 'Rust / Ink', accent: '#b4541f', deal: '#16181c', surface: '#fbf6f3', group: 'Red replaced' },

  { key: 'indigo', label: 'Indigo', accent: '#3f3baf', deal: '#c2410c', surface: '#f6f6fb', group: 'Other accents' },
  { key: 'ink', label: 'Ink', accent: '#1c222b', deal: '#c2410c', surface: '#f6f7f8', group: 'Other accents' },
  { key: 'teal', label: 'Teal', accent: '#0e6b70', deal: '#c2410c', surface: '#f3f9f9', group: 'Other accents' },
];

export const DEFAULT_THEME_KEY = 'emerald';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly siteSettings = inject(SiteSettingsService);

  readonly themes = THEMES;

  /** The saved theme, or the default when the key is missing or unrecognised. */
  readonly activeKey = computed(() => {
    const saved = this.siteSettings.theme().key;
    return THEMES.some((t) => t.key === saved) ? saved : DEFAULT_THEME_KEY;
  });

  readonly active = computed(
    () => THEMES.find((t) => t.key === this.activeKey()) ?? THEMES[0],
  );

  constructor() {
    // Site settings arrive after first paint, so the attribute is kept in step
    // rather than set once at bootstrap.
    effect(() => this.apply(this.activeKey()));
  }

  /**
   * Paint a theme without saving it, so the admin picker can be tried on.
   * Reverts on the next settings change unless the choice is saved.
   */
  preview(key: string): void {
    this.apply(key);
  }

  /** Drop any preview and go back to what is saved. */
  cancelPreview(): void {
    this.apply(this.activeKey());
  }

  private apply(key: string): void {
    this.document.documentElement.setAttribute('data-theme', key);
  }
}
