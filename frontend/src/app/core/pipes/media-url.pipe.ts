import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Origin of the API server, e.g. "https://vitalora-api.onrender.com" (empty when same-origin). */
const API_ORIGIN = environment.apiBaseUrl.replace(/\/api\/?$/, '');

/**
 * Admin-uploaded files are served by the API at /uploads/..., but the storefront
 * can live on a different domain, so a bare "/uploads/x.png" would resolve against
 * the storefront and 404. Bundled assets (/assets/...) and absolute URLs pass through.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return API_ORIGIN + url;
  return url;
}

@Pipe({ name: 'mediaUrl', standalone: true })
export class MediaUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    return resolveMediaUrl(url);
  }
}
