import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AboutContent } from '../../core/models/cms.model';
import { CmsService } from '../../core/services/cms.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.page.html',
})
export class AboutPage {
  private readonly cmsService = inject(CmsService);
  protected readonly content = signal<AboutContent | null>(null);

  constructor() {
    inject(SeoService).update('About Us', 'The story, mission and quality philosophy behind VITALORA premium wellness supplements.');
    this.cmsService.getAbout().subscribe((c) => this.content.set(c));
  }
}
