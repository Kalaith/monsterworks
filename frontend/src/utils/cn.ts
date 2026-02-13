/**
 * Utility function to conditionally join classNames
 * Similar to clsx but simpler implementation
 */

type ClassValue = string | undefined | null | false | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];

  const flatten = (value: ClassValue): void => {
    if (Array.isArray(value)) {
      value.forEach(flatten);
    } else if (value) {
      result.push(value);
    }
  };

  classes.forEach(flatten);
  return result.join(' ');
}

export default cn;
