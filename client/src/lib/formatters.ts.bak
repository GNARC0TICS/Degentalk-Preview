/**
 * Formatters for currency, date and other values
 * 
 * Provides consistent formatting across components
 */

/**
 * Format a currency value with the appropriate symbol
 * 
 * @param value - The numeric value to format
 * @param currency - The currency code (e.g., 'USD', 'DGT', 'USDT')
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string,
  options: {
    decimals?: number;
    showSymbol?: boolean;
    locale?: string;
  } = {}
): string {
  const {
    decimals = currency === 'DGT' ? 0 : 2,
    showSymbol = true,
    locale = 'en-US',
  } = options;

  // Handle special cases
  if (isNaN(value)) return '—';
  
  // Format based on currency type
  switch (currency.toUpperCase()) {
    case 'DGT':
      return `${value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${showSymbol ? ' DGT' : ''}`;
      
    case 'USD':
    case 'USDT':
      return `${showSymbol ? '$' : ''}${value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${showSymbol && currency === 'USDT' ? ' USDT' : ''}`;
      
    case 'TRX':
      return `${value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${showSymbol ? ' TRX' : ''}`;
      
    default:
      return `${value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${showSymbol ? ` ${currency}` : ''}`;
  }
}

/**
 * Format a date with a consistent display format
 * 
 * @param date - Date object or string to format
 * @param format - Optional format (short, medium, long, full)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  if (!date) return '—';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  if (isNaN(dateObj.getTime())) return '—';
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if the date is today or yesterday
  if (dateObj >= today) {
    return `Today at ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (dateObj >= yesterday) {
    return `Yesterday at ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  
  // Format based on desired length
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'medium':
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    case 'full':
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      });
    default:
      return dateObj.toLocaleString();
  }
}

/**
 * Format a number with abbreviations for large values (K, M, B)
 * 
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places to show
 * @returns Formatted abbreviated number
 */
export function formatNumber(value: number, decimals = 1): string {
  if (isNaN(value)) return '—';
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  } else {
    return value.toString();
  }
}

/**
 * Truncate text to a specific length with ellipsis
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength = 20): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format a wallet address for display by showing first and last few characters
 * 
 * @param address - The wallet address to format
 * @param startChars - Number of characters to show at the start
 * @param endChars - Number of characters to show at the end
 * @returns Formatted address
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '—';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
} 