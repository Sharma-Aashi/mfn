import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'instagram' | 'facebook' | 'twitter' | 'youtube'
  | 'orders' | 'heart' | 'pin' | 'user' | 'key'
  | 'box' | 'grid' | 'stack' | 'star' | 'help' | 'layout' | 'mail' | 'settings';

/**
 * Inline SVG icons. Rendered as real template elements rather than via
 * [innerHTML], which Angular's sanitizer would strip SVG out of.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('instagram') { <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /> }
        @case ('facebook') { <path d="M14 9h3V5h-3a4 4 0 00-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 011-1z" /> }
        @case ('twitter') { <path d="M4 4l16 16M20 4L4 20" /> }
        @case ('youtube') { <rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 9l5 3-5 3z" /> }
        @case ('orders') { <path d="M3 3h2l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /> }
        @case ('heart') { <path d="M12 21s-7.5-4.7-10-9.3C0.4 8.4 2 5 5.4 5c2 0 3.3 1 4.6 2.6C11.3 6 12.6 5 14.6 5 18 5 19.6 8.4 18 11.7 15.5 16.3 12 21 12 21z" /> }
        @case ('pin') { <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /> }
        @case ('user') { <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" /> }
        @case ('key') { <circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.7 12.3L21 2M16 7l3 3M19 4l2 2" /> }
        @case ('box') { <path d="M9 2h6l1 3h3a1 1 0 011 1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a1 1 0 011-1h3l1-3z" /> }
        @case ('grid') { <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /> }
        @case ('stack') { <path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /> }
        @case ('star') { <path d="M12 17.3L5.8 21l1.6-7.1L2 9.3l7.2-.6L12 2l2.8 6.7 7.2.6-5.4 4.6 1.6 7.1z" /> }
        @case ('help') { <circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 015.8 1c0 2-3 2-3 4M12 17h.01" /> }
        @case ('layout') { <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v5" /> }
        @case ('mail') { <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /> }
        @case ('settings') { <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /> }
      }
    </svg>
  `,
})
export class IconComponent {
  name = input.required<IconName>();
  size = input(16);
}
