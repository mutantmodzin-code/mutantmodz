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
    title: 'Mutant Modz – Best Pitshop & Bike Accessories in Coimbatore',
    description: 'Looking for the best Pit Stop in Coimbatore? Mutant Modz is your #1 pitshop for premium bike accessories, helmets, riding gear, and custom modifications in Singanallur. Shop Royal Enfield accessories & more.',
    keywords: 'mutant modz, motorcycle accessories shop near me, helmet shop near me, bike accessories near me, helmet shop coimbatore, garage in periyar nagar coimbatore, helmet repair shop near me, helmet shop in coimbatore, bike accessories nearby, mutant, bike accessories shop near me, near by bike accessories shop, local helmet shop near me',
    canonical: 'https://www.mutantmodz.in/',
  },
  products: {
    title: 'Premium Bike Accessories Online – Royal Enfield, KTM & more | Mutant Modz',
    description: 'Shop top-rated bike accessories in Coimbatore. Huge selection of Royal Enfield accessories, crash guards, LED lights and performance parts with fast delivery across Tamil Nadu.',
    keywords: 'motor bike accessories shop near me, bike accessories store near me, nearby bike accessories, bike spare parts shop near me, bike gear accessories shop near me, bike protection accessories, top rated helmet shop near me',
    canonical: 'https://www.mutantmodz.in/shop',
  },
  helmets: {
    title: 'Premium Helmets Coimbatore – AGV, Axor, Steelbird & more | Mutant Modz',
    description: 'Find the best premium helmets in Coimbatore. ISI and DOT certified helmets for ultimate safety and performance. Full face, modular & motocross helmets at Mutant Modz.',
    keywords: 'helmet shop near me, helmet shop coimbatore, helmet shop in coimbatore, helmet repair shop near me, helmet repairing shop, helmets for kids near me, helmet shop.near me, helmet light, top rated helmet shop near me, helmet shops near me, helmet, helmet spare parts shop near me, helmet store near me, helmet parts shop near me, helmet repair shop coimbatore, local helmet shop near me, steelbird helmet near me',
    canonical: 'https://www.mutantmodz.in/helmets',
  },
  accessories: {
    title: 'Custom Bike Modding & Accessories Coimbatore | Mutant Modz',
    description: 'Transform your ride with the best bike modding shop in Tamil Nadu. We offer premium crash guards, LED lights, and custom modifications for all major motorcycle brands.',
    keywords: 'bike accessories near me, bike accessories nearby, bike accessories shop near me, bike accessories, near by bike accessories shop, nearby bike accessories, nearby bike accessories shop, bike accessory shop near me, bike accessories coimbatore, coimbatore bike accessories shop, near me bike accessories shop, tail tidy shop near me, bike mods shop near me, bike accessories fitting near me',
    canonical: 'https://www.mutantmodz.in/accessories',
  },
  gear: {
    title: 'Riding Gear & Jackets Coimbatore – Protective & Stylish | Mutant Modz',
    description: 'Professional motorcycle riding gear in Coimbatore. CE-armoured jackets, gloves, and protective boots for serious riders. Shop the collection at Mutant Modz.',
    keywords: 'bike gears shop near me, bike gear accessories shop near me, studs shop near me, riding gear Coimbatore, riding jacket Tamil Nadu',
    canonical: 'https://www.mutantmodz.in/gear',
  },
  luggage: {
    title: 'Travel Further with Premium Bike Luggage | Mutant Modz Coimbatore',
    description: 'Road-trip essentials: Saddle bags, tank bags & touring luggage for your motorcycle. Shop the best luggage systems in Coimbatore at Mutant Modz.',
    keywords: 'bike luggage Coimbatore, saddle bags for motorcycle Coimbatore, tank bags for Royal Enfield, touring accessories Tamil Nadu',
    canonical: 'https://www.mutantmodz.in/luggage',
  },
  super: {
    title: 'Superbike Parts & Performance Upgrades Coimbatore | Mutant Modz',
    description: 'Performance parts for elite bikes. From exhausts to brake upgrades, find specialized superbike parts at the premier bike modding shop in Tamil Nadu.',
    keywords: 'superbike parts Coimbatore, performance exhaust Tamil Nadu, superbike accessories Coimbatore, premium motorcycle parts South India',
    canonical: 'https://www.mutantmodz.in/super',
  },
  combos: {
    title: 'Save Big on Bike Accessory Combo Packs | Mutant Modz',
    description: 'Exclusive bundle deals on helmets, riding gear, and accessories. Get the best value for your bike modding projects in Coimbatore.',
    keywords: 'bike accessory combo Coimbatore, motorcycle kit deals, helmet and jacket combo Tamil Nadu, discounted bike parts Coimbatore',
    canonical: 'https://www.mutantmodz.in/combos',
  },
  about: {
    title: 'About Mutant Modz – Coimbatore\'s Premier Bike Modification Pitshop',
    description: 'Mutant Modz is a specialized bike modding pitshop in Singanallur, Coimbatore. Since 2021, we\'ve provided riders with premium helmets, accessories, and expert customization services.',
    keywords: 'about Mutant Modz, pitshop Coimbatore, best bike accessories Tamil Nadu, motorcycle customization expert Coimbatore, Singanallur bike shop',
    canonical: 'https://www.mutantmodz.in/about-us',
  },
  contact: {
    title: 'Contact Mutant Modz – Visit Our Pitshop in Singanallur, Coimbatore',
    description: 'Find the best pit shop in Singanallur, Coimbatore at Mutant Modz. Located in Uppilipalayam, we offer genuine accessories, helmets, and expert advice. Call +91 88077 27227.',
    keywords: 'Mutant Modz address, pitshop Coimbatore, bike shop Singanallur, motorcycle shop phone number Coimbatore, check bike parts availability Coimbatore',
    canonical: 'https://www.mutantmodz.in/contact',
  },
  gallery: {
    title: 'Custom Bike Gallery – Modifications by Mutant Modz Coimbatore',
    description: 'Explore our portfolio of custom modified bikes. From Royal Enfield to superbikes, see why we are the top-rated bike modding shop in Tamil Nadu.',
    keywords: 'bike modification photos Coimbatore, custom bike gallery Tamil Nadu, Royal Enfield mod shop Coimbatore, motorcycle builds Coimbatore',
    canonical: 'https://www.mutantmodz.in/gallery',
  },
  'garage-sale': {
    title: 'Garage Sale – Bike Accessories Clearance | Mutant Modz Coimbatore',
    description: 'Unbeatable prices on clearance bike accessories, helmets, and gear. Top-quality parts at garage sale prices in Coimbatore. Shop while stocks last.',
    keywords: 'two spares, bike spare parts shop near me, bike spare part shop near me, garage in neelikonampalayam coimbatore, bike scratch guard shop near me, muzzleloader',
    canonical: 'https://www.mutantmodz.in/garage-sale',
  },
  blog: {
    title: 'Riding Tips & Bike Modding Guides | Mutant Modz Blog',
    description: 'Read the latest guides on bike modification in Tamil Nadu. Expert reviews of premium helmets and accessories from Coimbatore\'s top riding community hub.',
    keywords: 'bike modding guides, motorcycle tips Tamil Nadu, how to choose a helmet India, Royal Enfield maintenance guide Coimbatore',
    canonical: 'https://www.mutantmodz.in/blog',
  },
  brands: {
    title: 'Shop Premium Brands – Authorized Bike Accessories Dealer | Mutant Modz',
    description: 'Authorized dealer for leading brands like Axor, LS2, Rynox, and more in Coimbatore. Discover the best premium helmets and gear from global brands.',
    keywords: 'authorized bike dealer Coimbatore, LS2 helmets Coimbatore, Rynox gear Tamil Nadu, premium motorcycle brands India',
    canonical: 'https://www.mutantmodz.in/brands',
  },
  categories: {
    title: 'Explore All Bike Accessory Categories | Mutant Modz Coimbatore',
    description: 'From safety gear to performance parts, browse the full collection at Coimbatore\'s largest bike modification & accessory store.',
    keywords: 'bike parts shop Coimbatore, motorcycle categories Tamil Nadu, find bike parts near me, bike gear shop categories',
    canonical: 'https://www.mutantmodz.in/categories',
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
    canonical: `https://www.mutantmodz.in/product`,
  };
}
