/**
 * Utility function for concatenating class names
 * Similar to clsx but lightweight and tailored for our needs
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  return classes
    .flat()
    .filter((cls): cls is string | number => {
      return cls !== null && cls !== undefined && cls !== false && cls !== '';
    })
    .map(String)
    .join(' ')
    .trim();
}

export default cn;
