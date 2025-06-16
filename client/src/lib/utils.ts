import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | string, locale: string = 'en-US'): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(locale).format(num);
}

export function formatCurrency(value: number | string, currency: string = 'USD', locale: string = 'en-US'): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(num);
}

export function formatRelativeTime(date: Date | string | number): string {
  const target = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const diffMs = Date.now() - target.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const intervals: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34524, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year']
  ];
  let unit: Intl.RelativeTimeFormatUnit = 'second';
  let value = diffSec;
  for (const [amount, nextUnit] of intervals) {
    if (Math.abs(value) < amount) {
      break;
    }
    value = Math.round(value / amount);
    unit = nextUnit;
  }
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  return rtf.format(-value, unit);
}

export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  return initials;
}
