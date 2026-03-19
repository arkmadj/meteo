/**
 * Section utilities for dynamic page navigation
 * Provides helpers for extracting and managing page sections
 */

/**
 * Section metadata interface
 */
export interface SectionMetadata {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

/**
 * Navigation item interface
 */
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
}

/**
 * Convert section metadata to navigation items
 * @param sections - Array of section metadata
 * @returns Array of navigation items
 */
export const sectionsToNavItems = (sections: SectionMetadata[]): NavigationItem[] => {
  return sections.map(section => ({
    id: section.id,
    label: section.title,
    icon: section.icon,
  }));
};

/**
 * Find section by ID
 * @param sections - Array of section metadata
 * @param id - Section ID to find
 * @returns Section metadata or undefined
 */
export const findSectionById = (
  sections: SectionMetadata[],
  id: string
): SectionMetadata | undefined => {
  return sections.find(section => section.id === id);
};

/**
 * Get section by ID (throws if not found)
 * @param sections - Array of section metadata
 * @param id - Section ID to get
 * @returns Section metadata
 * @throws Error if section not found
 */
export const getSectionById = (sections: SectionMetadata[], id: string): SectionMetadata => {
  const section = findSectionById(sections, id);
  if (!section) {
    throw new Error(`Section with id "${id}" not found`);
  }
  return section;
};

/**
 * Validate that all section IDs are unique
 * @param sections - Array of section metadata
 * @returns True if all IDs are unique
 * @throws Error if duplicate IDs found
 */
export const validateSectionIds = (sections: SectionMetadata[]): boolean => {
  const ids = sections.map(s => s.id);
  const uniqueIds = new Set(ids);

  if (ids.length !== uniqueIds.size) {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    throw new Error(`Duplicate section IDs found: ${duplicates.join(', ')}`);
  }

  return true;
};

/**
 * Extract section metadata from DOM elements
 * Useful for dynamically detecting sections on a page
 * @param containerSelector - CSS selector for the container element
 * @param sectionSelector - CSS selector for section elements (default: '[id]')
 * @returns Array of section metadata extracted from DOM
 */
export const extractSectionsFromDOM = (
  containerSelector: string,
  sectionSelector: string = '[id]'
): SectionMetadata[] => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    return [];
  }

  const sections = container.querySelectorAll(sectionSelector);
  const metadata: SectionMetadata[] = [];

  sections.forEach(section => {
    const id = section.getAttribute('id');
    if (!id) return;

    // Try to extract title and icon from the section
    const titleElement = section.querySelector('h2, h3, [data-section-title]');
    const subtitleElement = section.querySelector('[data-section-subtitle], p');

    // Extract icon (emoji or icon element)
    const iconMatch = titleElement?.textContent?.match(/^([\u{1F300}-\u{1F9FF}])/u);
    const icon = iconMatch ? iconMatch[1] : '📄';

    // Extract title (remove icon if present)
    const title = titleElement?.textContent?.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '').trim() || id;

    // Extract subtitle
    const subtitle = subtitleElement?.textContent?.trim() || '';

    metadata.push({
      id,
      icon,
      title,
      subtitle,
    });
  });

  return metadata;
};

/**
 * Scroll to section with smooth behavior
 * @param sectionId - ID of the section to scroll to
 * @param offset - Offset from top in pixels (default: 100)
 * @returns True if section was found and scrolled to
 */
export const scrollToSection = (sectionId: string, offset: number = 100): boolean => {
  const element = document.getElementById(sectionId);
  if (!element) {
    return false;
  }

  const headerOffset = offset;
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });

  return true;
};

/**
 * Get the currently visible section based on scroll position
 * @param sections - Array of section metadata
 * @param offset - Offset from top in pixels (default: 150)
 * @returns ID of the currently visible section or null
 */
export const getCurrentSection = (
  sections: SectionMetadata[],
  offset: number = 150
): string | null => {
  const scrollPosition = window.scrollY + offset;

  // Find the section that's currently in view (iterate from bottom to top)
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i].id);
    if (section) {
      const sectionTop = section.offsetTop;
      if (scrollPosition >= sectionTop) {
        return sections[i].id;
      }
    }
  }

  return sections[0]?.id || null;
};

/**
 * Create a throttled scroll handler for section tracking
 * @param callback - Callback function to call on scroll
 * @returns Cleanup function to remove the scroll listener
 */
export const createScrollTracker = (callback: () => void): (() => void) => {
  let ticking = false;

  const scrollListener = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', scrollListener);

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', scrollListener);
  };
};
