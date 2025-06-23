/**
 * SEO optimization utilities
 */

interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

class SEOManager {
  private defaultConfig: SEOConfig = {
    title: 'Labrish - Caribbean Voice AI Platform',
    description: 'Experience authentic Caribbean voices with AI-powered storytelling and conversation. Create, share, and listen to stories in authentic island accents.',
    keywords: ['Caribbean', 'AI voices', 'storytelling', 'text-to-speech', 'Jamaican', 'Trinidadian', 'Barbadian'],
    siteName: 'Labrish',
    locale: 'en_US',
    type: 'website',
  };

  updatePageSEO(config: Partial<SEOConfig>): void {
    const fullConfig = { ...this.defaultConfig, ...config };

    // Update title
    document.title = fullConfig.title;

    // Clear existing meta tags
    this.clearMetaTags();

    // Set new meta tags
    this.setMetaTags([
      { name: 'description', content: fullConfig.description },
      { name: 'keywords', content: fullConfig.keywords?.join(', ') || '' },
      { name: 'author', content: fullConfig.author || 'Labrish Team' },
      
      // Open Graph tags
      { property: 'og:title', content: fullConfig.title },
      { property: 'og:description', content: fullConfig.description },
      { property: 'og:type', content: fullConfig.type || 'website' },
      { property: 'og:site_name', content: fullConfig.siteName || 'Labrish' },
      { property: 'og:locale', content: fullConfig.locale || 'en_US' },
      
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullConfig.title },
      { name: 'twitter:description', content: fullConfig.description },
      
      // Additional meta tags
      { name: 'robots', content: 'index, follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#14b8a6' },
    ]);

    // Set conditional meta tags
    if (fullConfig.image) {
      this.setMetaTags([
        { property: 'og:image', content: fullConfig.image },
        { name: 'twitter:image', content: fullConfig.image },
      ]);
    }

    if (fullConfig.url) {
      this.setMetaTags([
        { property: 'og:url', content: fullConfig.url },
      ]);
    }

    if (fullConfig.publishedTime) {
      this.setMetaTags([
        { property: 'article:published_time', content: fullConfig.publishedTime },
      ]);
    }

    if (fullConfig.modifiedTime) {
      this.setMetaTags([
        { property: 'article:modified_time', content: fullConfig.modifiedTime },
      ]);
    }

    // Update canonical URL
    this.updateCanonicalURL(fullConfig.url || window.location.href);
  }

  private clearMetaTags(): void {
    const existingTags = document.querySelectorAll('meta[name], meta[property]');
    existingTags.forEach(tag => {
      const name = tag.getAttribute('name') || tag.getAttribute('property');
      if (name && this.isManageableTag(name)) {
        tag.remove();
      }
    });
  }

  private isManageableTag(name: string): boolean {
    const manageableTags = [
      'description', 'keywords', 'author', 'robots',
      'og:title', 'og:description', 'og:type', 'og:image', 'og:url', 'og:site_name', 'og:locale',
      'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image',
      'article:published_time', 'article:modified_time'
    ];
    return manageableTags.includes(name);
  }

  private setMetaTags(tags: MetaTag[]): void {
    const head = document.head;
    
    tags.forEach(tag => {
      if (!tag.content) return;
      
      const meta = document.createElement('meta');
      
      if (tag.name) {
        meta.setAttribute('name', tag.name);
      }
      
      if (tag.property) {
        meta.setAttribute('property', tag.property);
      }
      
      meta.setAttribute('content', tag.content);
      head.appendChild(meta);
    });
  }

  private updateCanonicalURL(url: string): void {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    
    canonical.href = url;
  }

  generateStructuredData(type: 'WebSite' | 'Article' | 'Organization', data: any): void {
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  generateWebSiteStructuredData(): void {
    this.generateStructuredData('WebSite', {
      name: 'Labrish',
      description: 'Caribbean Voice AI Platform for authentic storytelling and conversation',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });
  }

  generateOrganizationStructuredData(): void {
    this.generateStructuredData('Organization', {
      name: 'Labrish',
      description: 'Caribbean Voice AI Platform',
      url: window.location.origin,
      logo: `${window.location.origin}/logo.png`,
      sameAs: [
        // Add social media URLs when available
      ],
    });
  }
}

// Create singleton instance
export const seoManager = new SEOManager();

// React hook for SEO
export const useSEO = () => {
  const updateSEO = (config: Partial<SEOConfig>) => {
    seoManager.updatePageSEO(config);
  };

  const setPageTitle = (title: string) => {
    document.title = title;
  };

  const setPageDescription = (description: string) => {
    seoManager.updatePageSEO({ description });
  };

  return {
    updateSEO,
    setPageTitle,
    setPageDescription,
    generateWebSiteStructuredData: seoManager.generateWebSiteStructuredData.bind(seoManager),
    generateOrganizationStructuredData: seoManager.generateOrganizationStructuredData.bind(seoManager),
  };
};

// Page-specific SEO configurations
export const pageConfigs = {
  home: {
    title: 'Labrish - Caribbean Voice AI Platform',
    description: 'Experience authentic Caribbean voices with AI-powered storytelling and conversation. Create, share, and listen to stories in authentic island accents.',
    keywords: ['Caribbean voices', 'AI storytelling', 'text-to-speech', 'Jamaican accent', 'Caribbean culture'],
  },
  
  dashboard: {
    title: 'Dashboard - Labrish',
    description: 'Manage your Caribbean stories, voice settings, and audio creations in your personal Labrish dashboard.',
    keywords: ['dashboard', 'story management', 'voice settings', 'audio library'],
  },
  
  textToSpeech: {
    title: 'Text-to-Speech Studio - Labrish',
    description: 'Convert your text to authentic Caribbean voices with our AI-powered text-to-speech studio. Create engaging audio content with island accents.',
    keywords: ['text-to-speech', 'Caribbean voices', 'AI audio', 'voice synthesis', 'audio creation'],
  },
  
  pricing: {
    title: 'Pricing - Labrish',
    description: 'Choose the perfect plan for your Caribbean storytelling needs. Affordable pricing for individuals and businesses.',
    keywords: ['pricing', 'subscription plans', 'Caribbean AI voices', 'storytelling platform'],
  },
};