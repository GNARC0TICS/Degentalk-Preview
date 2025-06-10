import { format, formatDistanceToNow, isToday, isYesterday, formatRelative } from 'date-fns';

/**
 * Formats a date for display in the UI
 *
 * @param date The date to format
 * @param options Configuration options for formatting
 * @returns A formatted date string
 */
export function formatDate(
	date: string | Date,
	options: {
		includeTime?: boolean;
		relative?: boolean;
		short?: boolean;
	} = {
		includeTime: false,
		relative: false,
		short: false
	}
) {
	const dateObj = typeof date === 'string' ? new Date(date) : date;

	// For invalid dates, return empty string
	if (isNaN(dateObj.getTime())) {
		return '';
	}

	if (options.relative) {
		return formatDistanceToNow(dateObj, { addSuffix: true });
	}

	if (isToday(dateObj)) {
		if (options.short) {
			return format(dateObj, options.includeTime ? 'h:mm a' : "'Today'");
		}
		return format(dateObj, options.includeTime ? "'Today at' h:mm a" : "'Today'");
	}

	if (isYesterday(dateObj)) {
		if (options.short) {
			return format(dateObj, options.includeTime ? "'Yest.' h:mm a" : "'Yesterday'");
		}
		return format(dateObj, options.includeTime ? "'Yesterday at' h:mm a" : "'Yesterday'");
	}

	// Within last 6 days, show day name
	const sixDaysAgo = new Date();
	sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
	if (dateObj > sixDaysAgo) {
		if (options.short) {
			return format(dateObj, options.includeTime ? 'ccc h:mm a' : 'ccc');
		}
		return format(dateObj, options.includeTime ? "EEEE 'at' h:mm a" : 'EEEE');
	}

	// Otherwise show full date
	if (options.short) {
		return format(dateObj, options.includeTime ? 'MM/dd/yy h:mm a' : 'MM/dd/yy');
	}
	return format(dateObj, options.includeTime ? "MMMM d, yyyy 'at' h:mm a" : 'MMMM d, yyyy');
}

/**
 * Formats a timestamp specifically for the forum UI
 *
 * @param date The date to format
 * @returns A user-friendly formatted date
 */
export function formatForumDate(date: string | Date) {
	return formatDate(date, { relative: true });
}

/**
 * Formats a timestamp specifically for the forum thread UI
 *
 * @param date The date to format
 * @returns A more detailed formatted date with time
 */
export function formatThreadTimestamp(date: string | Date) {
	return formatDate(date, { includeTime: true });
}
