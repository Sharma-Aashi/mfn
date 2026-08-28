import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PolicyContent } from '../../core/models/cms.model';
import { CmsService } from '../../core/services/cms.service';
import { SeoService } from '../../core/services/seo.service';

type PolicyKey = keyof PolicyContent;

@Component({
  selector: 'app-policy',
  standalone: true,
  template: `
    <div class="container-vitalora max-w-3xl py-12 sm:py-16">
      @if (policy(); as p) {
        <h1 class="font-display text-3xl font-semibold text-charcoal-900">{{ p.title }}</h1>
        <p class="mt-6 whitespace-pre-line leading-relaxed text-charcoal-600">{{ p.body }}</p>
      } @else {
        <div class="h-40 skeleton rounded-2xl"></div>
      }
    </div>
  `,
})
export class PolicyPage {
  private readonly cmsService = inject(CmsService);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  protected readonly policy = signal<{ title: string; body: string } | null>(null);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const slug = (params.get('slug') ?? 'privacy') as PolicyKey;
      this.cmsService.getPolicies().subscribe((all) => {
        const p = all[slug] ?? all.privacy;
        this.policy.set(p);
        this.seo.update(p.title);
      });
    });
  }
}
