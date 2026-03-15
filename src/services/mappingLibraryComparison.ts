/**
 * Mapping Library Comparison Service
 * Comprehensive analysis of Leaflet, Mapbox GL JS, OpenLayers, and Google Maps JS
 */

export interface MappingLibraryFeatures {
  name: string;
  version: string;
  bundleSize: string;
  performance: 'excellent' | 'good' | 'fair' | 'poor';
  features: {
    vectorTiles: boolean;
    webGL: boolean;
    clustering: boolean;
    heatmaps: boolean;
    customStyling: boolean;
    offlineSupport: boolean;
    mobileOptimized: boolean;
    accessibility: 'poor' | 'fair' | 'good' | 'excellent';
  };
  weatherSpecific: {
    weatherLayers: boolean;
    radarOverlays: boolean;
    satelliteImagery: boolean;
    animatedLayers: boolean;
    customMarkers: boolean;
  };
  cost: {
    model: 'free' | 'freemium' | 'paid';
    freeLimit?: string;
    paidStartsAt?: string;
  };
  pros: string[];
  cons: string[];
  bestFor: string[];
}

export const mappingLibraries: MappingLibraryFeatures[] = [
  {
    name: 'Leaflet',
    version: '1.9.4',
    bundleSize: '~39KB (gzipped)',
    performance: 'good',
    features: {
      vectorTiles: false, // Requires plugins
      webGL: false,
      clustering: true, // Via plugins
      heatmaps: true, // Via plugins
      customStyling: true,
      offlineSupport: true, // Via plugins
      mobileOptimized: true,
      accessibility: 'fair',
    },
    weatherSpecific: {
      weatherLayers: true,
      radarOverlays: true,
      satelliteImagery: true,
      animatedLayers: true, // Via plugins
      customMarkers: true,
    },
    cost: {
      model: 'free',
    },
    pros: [
      'Completely free and open source',
      'Lightweight and fast loading',
      'Huge plugin ecosystem',
      'Simple API and great documentation',
      'No API keys or usage limits',
      'Works with any tile provider',
      'Excellent React integration',
      'Mobile-friendly out of the box',
    ],
    cons: [
      'No native vector tile support',
      'No WebGL acceleration',
      'Limited built-in styling options',
      'Requires plugins for advanced features',
      'Performance degrades with many markers',
      'No native clustering (needs plugins)',
    ],
    bestFor: [
      'Budget-conscious projects',
      'Simple weather overlays',
      'Custom tile providers',
      'Open source projects',
      'Rapid prototyping',
      'Educational projects',
    ],
  },
  {
    name: 'Mapbox GL JS',
    version: '2.15.0',
    bundleSize: '~500KB (gzipped)',
    performance: 'excellent',
    features: {
      vectorTiles: true,
      webGL: true,
      clustering: true,
      heatmaps: true,
      customStyling: true,
      offlineSupport: true,
      mobileOptimized: true,
      accessibility: 'good',
    },
    weatherSpecific: {
      weatherLayers: true,
      radarOverlays: true,
      satelliteImagery: true,
      animatedLayers: true,
      customMarkers: true,
    },
    cost: {
      model: 'freemium',
      freeLimit: '50,000 map loads/month',
      paidStartsAt: '$5/1,000 additional loads',
    },
    pros: [
      'Excellent performance with WebGL',
      'Beautiful vector tiles and styling',
      'Smooth animations and transitions',
      'Great mobile performance',
      'Comprehensive feature set',
      'Active development and support',
      'Excellent documentation',
      'Built-in clustering and heatmaps',
    ],
    cons: [
      'Larger bundle size',
      'Requires API key and has usage limits',
      'Can be expensive for high-traffic apps',
      'Proprietary (though open source version exists)',
      'Learning curve for advanced styling',
      'Requires Mapbox account',
    ],
    bestFor: [
      'High-performance weather apps',
      'Beautiful custom styling',
      'Mobile-first applications',
      'Professional/commercial projects',
      'Apps with moderate traffic',
      'Advanced weather visualizations',
    ],
  },
  {
    name: 'OpenLayers',
    version: '8.2.0',
    bundleSize: '~200KB (gzipped, tree-shaken)',
    performance: 'good',
    features: {
      vectorTiles: true,
      webGL: true,
      clustering: true,
      heatmaps: true,
      customStyling: true,
      offlineSupport: true,
      mobileOptimized: true,
      accessibility: 'good',
    },
    weatherSpecific: {
      weatherLayers: true,
      radarOverlays: true,
      satelliteImagery: true,
      animatedLayers: true,
      customMarkers: true,
    },
    cost: {
      model: 'free',
    },
    pros: [
      'Completely free and open source',
      'Most comprehensive feature set',
      'Excellent for complex GIS applications',
      'Supports many data formats',
      'Great for scientific/meteorological apps',
      'No usage limits or API keys',
      'Modular architecture (tree-shakable)',
      'Strong community support',
    ],
    cons: [
      'Steeper learning curve',
      'Larger bundle size than Leaflet',
      'Complex API for simple use cases',
      'Less beginner-friendly documentation',
      'Overkill for basic weather maps',
      'Requires more configuration',
    ],
    bestFor: [
      'Complex weather data visualization',
      'Scientific/meteorological applications',
      'GIS-heavy weather apps',
      'Custom data format support',
      'Enterprise weather solutions',
      'Advanced spatial analysis',
    ],
  },
  {
    name: 'Google Maps JS',
    version: '3.55',
    bundleSize: '~300KB (loaded dynamically)',
    performance: 'excellent',
    features: {
      vectorTiles: true,
      webGL: true,
      clustering: true, // Via libraries
      heatmaps: true,
      customStyling: true,
      offlineSupport: false,
      mobileOptimized: true,
      accessibility: 'excellent',
    },
    weatherSpecific: {
      weatherLayers: true, // Via third-party
      radarOverlays: true,
      satelliteImagery: true,
      animatedLayers: false, // Limited
      customMarkers: true,
    },
    cost: {
      model: 'freemium',
      freeLimit: '$200 credit/month (~28,000 map loads)',
      paidStartsAt: '$7/1,000 additional loads',
    },
    pros: [
      'Excellent performance and reliability',
      'Best-in-class user experience',
      'Familiar interface for users',
      'Great mobile support',
      'Excellent accessibility',
      'Comprehensive Places API integration',
      'Strong ecosystem and support',
      'Regular updates and improvements',
    ],
    cons: [
      'Most expensive option',
      'Requires API key and billing setup',
      'Limited customization options',
      'Vendor lock-in concerns',
      'No offline support',
      'Limited weather-specific features',
      'Usage tracking and privacy concerns',
    ],
    bestFor: [
      'Consumer-facing weather apps',
      'Apps requiring Places integration',
      'Maximum user familiarity',
      'Enterprise applications with budget',
      'Apps needing excellent accessibility',
      'Location-based weather services',
    ],
  },
];

/**
 * Decision matrix for choosing mapping library
 */
export interface ProjectRequirements {
  budget: 'free' | 'low' | 'medium' | 'high';
  expectedTraffic: 'low' | 'medium' | 'high' | 'enterprise';
  complexity: 'simple' | 'moderate' | 'complex';
  weatherFeatures: ('basic' | 'radar' | 'satellite' | 'animations' | 'heatmaps')[];
  performance: 'basic' | 'good' | 'excellent';
  customization: 'minimal' | 'moderate' | 'extensive';
  offline: boolean;
  mobile: boolean;
}

export function recommendMappingLibrary(requirements: ProjectRequirements): {
  recommended: MappingLibraryFeatures;
  alternatives: MappingLibraryFeatures[];
  reasoning: string[];
} {
  const libraries = [...mappingLibraries];
  const scores = libraries.map(lib => ({
    library: lib,
    score: calculateScore(lib, requirements),
  }));

  scores.sort((a, b) => b.score - a.score);

  const recommended = scores[0].library;
  const alternatives = scores.slice(1, 3).map(s => s.library);
  const reasoning = generateReasoning(recommended, requirements);

  return { recommended, alternatives, reasoning };
}

function calculateScore(library: MappingLibraryFeatures, req: ProjectRequirements): number {
  let score = 0;

  // Budget scoring
  if (req.budget === 'free' && library.cost.model === 'free') score += 30;
  else if (req.budget === 'low' && library.cost.model !== 'paid') score += 20;
  else if (req.budget === 'medium') score += 15;
  else if (req.budget === 'high') score += 10;

  // Traffic scoring
  if (req.expectedTraffic === 'high' || req.expectedTraffic === 'enterprise') {
    if (library.cost.model === 'free') score += 20;
    else score -= 10; // Paid services can get expensive
  }

  // Performance scoring
  const perfMap = { poor: 0, fair: 5, good: 10, excellent: 15 };
  score += perfMap[library.performance];

  // Feature scoring
  if (req.weatherFeatures.includes('radar') && library.weatherSpecific.radarOverlays) score += 10;
  if (req.weatherFeatures.includes('satellite') && library.weatherSpecific.satelliteImagery)
    score += 10;
  if (req.weatherFeatures.includes('animations') && library.weatherSpecific.animatedLayers)
    score += 10;
  if (req.weatherFeatures.includes('heatmaps') && library.features.heatmaps) score += 10;

  // Complexity scoring
  if (req.complexity === 'simple' && library.name === 'Leaflet') score += 15;
  if (req.complexity === 'complex' && library.name === 'OpenLayers') score += 15;

  // Mobile scoring
  if (req.mobile && library.features.mobileOptimized) score += 10;

  // Offline scoring
  if (req.offline && library.features.offlineSupport) score += 15;

  return score;
}

function generateReasoning(library: MappingLibraryFeatures, req: ProjectRequirements): string[] {
  const reasons = [];

  if (library.cost.model === 'free') {
    reasons.push(`${library.name} is completely free with no usage limits`);
  }

  if (library.performance === 'excellent') {
    reasons.push(
      `Excellent performance with ${library.features.webGL ? 'WebGL acceleration' : 'optimized rendering'}`
    );
  }

  if (req.weatherFeatures.length > 0) {
    reasons.push(`Strong weather feature support including ${req.weatherFeatures.join(', ')}`);
  }

  if (req.mobile && library.features.mobileOptimized) {
    reasons.push('Optimized for mobile devices and touch interactions');
  }

  if (library.bundleSize.includes('39KB')) {
    reasons.push('Lightweight bundle size for fast loading');
  }

  return reasons;
}

export default {
  mappingLibraries,
  recommendMappingLibrary,
};
