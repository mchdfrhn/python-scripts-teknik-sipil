import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Clamp a number between min and max bounds.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Format a number to fixed decimal places with unit suffix.
 */
export function formatMetric(value: number, decimals = 1, unit = ""): string {
  return `${value.toFixed(decimals)}${unit ? ` ${unit}` : ""}`
}
