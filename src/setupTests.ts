import '@testing-library/jest-dom';
// Initialize i18n once for all tests so components using `useTranslation` have
// a properly configured i18next instance (avoids NO_I18NEXT_INSTANCE warnings
// and ensures keys like `search.useCurrentLocation` resolve to real strings).
import '@/i18n/config';
import { toHaveNoViolations } from 'jest-axe';
import { TextDecoder, TextEncoder } from 'util';

// Extend Jest matchers with jest-axe
expect.extend(toHaveNoViolations);

// Polyfill TextEncoder/TextDecoder for Node environment
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// Mock matchMedia for Embla Carousel
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver for Embla Carousel
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock scrollTo for carousel navigation
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock Element.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();

// Mock HTMLCanvasElement for ReactAnimatedWeather
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock canvas dimensions for ReactAnimatedWeather
Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  value: 40,
  writable: true,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  value: 40,
  writable: true,
});

// Mock Leaflet for map components
jest.mock('leaflet/dist/leaflet.css', () => ({}));

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  writable: true,
  value: mockGeolocation,
  configurable: true,
});
