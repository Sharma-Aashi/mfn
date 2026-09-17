import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AboutContent } from '../../core/models/cms.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';
import { CmsService } from '../../core/services/cms.service';
import { SeoService } from '../../core/services/seo.service';
import { SiteSettingsService } from '../../core/services/site-settings.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, MediaUrlPipe],
  templateUrl: './about.page.html',
})
export class AboutPage {
  private readonly cmsService = inject(CmsService);
  protected readonly content = signal<AboutContent | null>(null);
  protected readonly brand = inject(SiteSettingsService).brand;

  constructor() {
    inject(SeoService).update('About Us', 'Our story, mission and quality philosophy behind our premium wellness supplements.');
    this.cmsService.getAbout().subscribe((c) => this.content.set(c));
  }
}
