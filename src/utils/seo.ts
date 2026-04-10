/**
 * SEO Utility — Dynamic meta tag management for SPA pages
 * Updates document title, meta description, keywords, and Open Graph tags
 * on each page navigation to maximize search engine visibility.
 */

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonical?: string;
}

/**
 * Updates the document head with page-specific SEO meta tags.
 * Call this inside useEffect() on every page component.
 */
export function updatePageSEO(config: SEOConfig): void {
  // Update title
  document.title = config.title;

  // Helper to set or create a meta tag
  const setMeta = (attr: string, key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Primary meta
  setMeta('name', 'description', config.description);
  if (config.keywords) {
    setMeta('name', 'keywords', config.keywords);
  }

  // Open Graph
  setMeta('property', 'og:title', config.ogTitle || config.title);
  setMeta('property', 'og:description', config.ogDescription || config.description);

  // Twitter
  setMeta('name', 'twitter:title', config.ogTitle || config.title);
  setMeta('name', 'twitter:description', config.ogDescription || config.description);

  // Canonical
  if (config.canonical) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', config.canonical);
  }
}

/** Page-specific SEO configurations */
export const PAGE_SEO: Record<string, SEOConfig> = {
  home: {
    title: 'Mutant Modz – Premium Bike Accessories & Helmets in Coimbatore | Shop Online',
    description: 'Mutant Modz is Coimbatore\'s #1 bike accessories store. Shop premium helmets, riding jackets, crash guards, LED lights, exhausts & aftermarket parts for Royal Enfield, KTM, Yamaha & more. Visit or buy online.',
    keywords: 'bike accessories Coimbatore, premium helmets Coimbatore, buy motorcycle helmet online Coimbatore, bike modification shop near me, aftermarket bike parts South India, Mutant Modz, mutantmodz.in, pit shop Coimbatore, motorcycle accessories Coimbatore, two wheeler accessories Coimbatore',
    canonical: 'https://mutantmodz.in/',
  },
  products: {
    title: 'Shop Bike Accessories Online – Helmets, Guards & More | Mutant Modz',
    description: 'Browse 500+ premium bike accessories at Mutant Modz. Helmets, crash guards, LED lights, riding jackets, exhausts & aftermarket parts for Royal Enfield, KTM, Yamaha, Honda, Bajaj, TVS. Fast delivery across India.',
    keywords: 'buy bike accessories online India, motorcycle parts online Coimbatore, aftermarket bike parts South India, bike accessories shop near me, two wheeler accessories online, Royal Enfield accessories, KTM parts online',
    canonical: 'https://mutantmodz.in/#products',
  },
  helmets: {
    title: 'Premium Helmets Coimbatore – Full Face, Modular & Carbon | Mutant Modz',
    description: 'Buy ISI & DOT-certified motorcycle helmets in Coimbatore. Full-face, modular, open-face & carbon fiber helmets from top brands. Visit Mutant Modz or order online. Fast delivery across Tamil Nadu.',
    keywords: 'premium helmets Coimbatore, buy motorcycle helmet online Coimbatore, full face helmet Coimbatore, modular helmet India, ISI certified helmet, DOT helmet India, carbon fiber helmet, best helmet shop Coimbatore',
    canonical: 'https://mutantmodz.in/#category?type=helmets',
  },
  accessories: {
    title: 'Bike Accessories Coimbatore – LED, Guards, Mirrors & More | Mutant Modz',
    description: 'Crash guards, LED fog lights, mobile mounts, mirrors, grips & performance accessories for Royal Enfield, KTM, Yamaha & more. Coimbatore\'s largest bike accessories collection at Mutant Modz.',
    keywords: 'bike accessories Coimbatore, crash guard Royal Enfield, LED fog lights bike, mobile mount bike, motorcycle mirrors, handlebar grips, bike modification Coimbatore, aftermarket bike parts',
    canonical: 'https://mutantmodz.in/#category?type=accessories',
  },
  gear: {
    title: 'Riding Jackets & Gear Coimbatore – CE Armoured | Mutant Modz',
    description: 'All-weather CE-armoured riding jackets, gloves, knee guards & protective gear in Coimbatore. Perfect for daily commutes and long-distance touring. Shop at Mutant Modz online or in-store.',
    keywords: 'riding jacket Coimbatore, motorcycle riding gear India, CE armoured jacket, riding gloves, knee guard bike, protective gear motorcycle, touring gear Coimbatore',
    canonical: 'https://mutantmodz.in/#category?type=gear',
  },
  luggage: {
    title: 'Bike Luggage & Touring Bags Coimbatore – Saddle & Tank Bags | Mutant Modz',
    description: 'Saddle bags, tank bags, tail bags & touring panniers for long-distance rides. Top brands at Mutant Modz, Coimbatore. Perfect for Royal Enfield Himalayan & KTM Adventure touring setups.',
    keywords: 'bike saddle bags Coimbatore, tank bag motorcycle, touring bags India, Royal Enfield luggage, pannier bags bike, motorcycle touring accessories, long ride accessories',
    canonical: 'https://mutantmodz.in/#category?type=luggage',
  },
  super: {
    title: 'Superbike Parts & Performance Upgrades | Mutant Modz Coimbatore',
    description: 'Aftermarket superbike parts for Ducati, Kawasaki, BMW, Suzuki & more. Performance exhaust, brake upgrades, suspension kits. South India\'s premium superbike parts hub at Mutant Modz Coimbatore.',
    keywords: 'superbike parts India, aftermarket bike parts South India, performance exhaust Coimbatore, brake upgrade motorcycle, Ducati parts India, Kawasaki accessories, BMW motorcycle parts',
    canonical: 'https://mutantmodz.in/#category?type=super',
  },
  combos: {
    title: 'Bike Accessory Combo Packs – Save More at Mutant Modz Coimbatore',
    description: 'Curated combo packs for Royal Enfield, KTM & Yamaha riders. Helmet + jacket bundles, LED kits, complete touring setups at unbeatable prices. Mutant Modz, Coimbatore.',
    keywords: 'bike accessories combo, motorcycle combo pack, helmet jacket combo, Royal Enfield accessories kit, bike modification combo Coimbatore',
    canonical: 'https://mutantmodz.in/#products?cat=combos',
  },
  about: {
    title: 'About Mutant Modz – Coimbatore\'s Top Bike Accessories Store Since 2021',
    description: 'Mutant Modz was founded in 2021 in Coimbatore, Tamil Nadu. We are a team of passionate riders offering 500+ premium bike accessories, helmets & riding gear from 50+ elite brands. Visit our store in Uppilipalayam.',
    keywords: 'about Mutant Modz, bike accessories store Coimbatore, motorcycle shop Coimbatore, Mutant Modz Uppilipalayam, bike modification workshop Coimbatore',
    canonical: 'https://mutantmodz.in/#about',
  },
  contact: {
    title: 'Contact Mutant Modz – Visit Our Bike Accessories Store in Coimbatore',
    description: 'Visit Mutant Modz at Uppilipalayam, Coimbatore or call +91 95975 96755. Open Mon-Sat 10AM-8PM, Sun 10AM-6PM. Expert advice on helmets, riding gear & bike modifications. WhatsApp available.',
    keywords: 'Mutant Modz contact, bike shop Coimbatore address, Mutant Modz phone number, bike accessories shop near me Coimbatore, Uppilipalayam bike shop, motorcycle shop contact Coimbatore',
    canonical: 'https://mutantmodz.in/#contact',
  },
  gallery: {
    title: 'Gallery – Custom Bike Builds & Modifications | Mutant Modz Coimbatore',
    description: 'See our latest custom bike builds, modification projects and accessory installations at Mutant Modz Coimbatore. Royal Enfield, KTM, Yamaha custom builds and more.',
    keywords: 'custom bike builds Coimbatore, bike modification gallery, Royal Enfield custom build, motorcycle modification photos, Mutant Modz gallery',
    canonical: 'https://mutantmodz.in/#gallery',
  },
  'garage-sale': {
    title: 'Garage Sale – Discounted Bike Accessories | Mutant Modz Coimbatore',
    description: 'Massive discounts on premium bike accessories at Mutant Modz Garage Sale. Limited-time deals on helmets, riding jackets, crash guards & more. Coimbatore\'s best bike accessory deals.',
    keywords: 'bike accessories sale Coimbatore, discounted helmets, motorcycle accessories offer, garage sale bike parts, cheap bike accessories India',
    canonical: 'https://mutantmodz.in/#garage-sale',
  },
  blog: {
    title: 'Bike Modification Tips & Riding Guides | Mutant Modz Blog',
    description: 'Expert tips on bike modifications, helmet buying guides, riding gear reviews and motorcycle maintenance from Mutant Modz Coimbatore. Stay updated with the latest in the biking world.',
    keywords: 'bike modification tips, helmet buying guide India, riding gear review, motorcycle maintenance tips, Royal Enfield modification guide, best bike accessories guide',
    canonical: 'https://mutantmodz.in/#blog',
  },
  brands: {
    title: 'Shop by Brands – 50+ Premium Motorcycle Brands | Mutant Modz',
    description: 'Authorized dealer for 50+ premium motorcycle accessory brands. Shop genuine parts from Studds, Steelbird, Rynox, Mototech, Raida, Cramster & more at Mutant Modz Coimbatore.',
    keywords: 'motorcycle brands India, bike accessories brands, Studds helmets, Steelbird helmets, Rynox riding gear, authorized bike accessories dealer Coimbatore',
    canonical: 'https://mutantmodz.in/#brands',
  },
  categories: {
    title: 'All Categories – Bike Accessories & Riding Gear | Mutant Modz',
    description: 'Browse all categories of bike accessories at Mutant Modz. Helmets, riding gear, crash guards, LED lights, exhaust systems, luggage, superbike parts and combo packs. Shop by category now.',
    keywords: 'bike accessories categories, motorcycle accessories types, helmet category, riding gear category, bike parts catalogue Coimbatore',
    canonical: 'https://mutantmodz.in/#categories',
  },
};

/**
 * Gets SEO config for a product detail page.
 * Dynamically generated from product data.
 */
export function getProductDetailSEO(productName: string, category?: string, price?: string): SEOConfig {
  const cleanName = productName || 'Premium Bike Accessory';
  const cleanCategory = category || 'Bike Accessories';
  const priceText = price ? ` @ ${price}` : '';
  
  return {
    title: `${cleanName} – Buy Online${priceText} | Mutant Modz Coimbatore`,
    description: `Buy ${cleanName} online from Mutant Modz, Coimbatore. Genuine ${cleanCategory} with warranty. Fast delivery across Tamil Nadu & India. Available for Royal Enfield, KTM, Yamaha & more.`,
    keywords: `${cleanName}, ${cleanCategory} Coimbatore, buy ${cleanCategory} online, ${cleanCategory} price India, Mutant Modz`,
    canonical: `https://mutantmodz.in/#productDetails`,
  };
}
