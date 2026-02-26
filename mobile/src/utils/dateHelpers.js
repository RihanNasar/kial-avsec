// KIAL AVSEC Mobile - Date Helpers
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
        return '—';
    }
};

/**
 * Format a date to short format
 */
export const formatDateShort = (dateStr) => {
    if (!dateStr) return '—';
    try {
        return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
        return '—';
    }
};

/**
 * Check if a date has passed (expired)
 */
export const isExpired = (dateStr) => {
    if (!dateStr) return false;
    return isBefore(new Date(dateStr), new Date());
};

/**
 * Check if a date is expiring within the next N days
 */
export const isExpiringSoon = (dateStr, days = 30) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const threshold = addDays(now, days);
    return isAfter(date, now) && isBefore(date, threshold);
};

/**
 * Get days until expiry (negative if expired)
 */
export const daysUntilExpiry = (dateStr) => {
    if (!dateStr) return null;
    return differenceInDays(new Date(dateStr), new Date());
};

/**
 * Get expiry status label and color
 */
export const getExpiryStatus = (dateStr) => {
    if (!dateStr) return { label: 'N/A', color: 'textTertiary' };

    const days = daysUntilExpiry(dateStr);

    if (days < 0) return { label: 'Expired', color: 'danger' };
    if (days <= 7) return { label: `${days}d left`, color: 'danger' };
    if (days <= 30) return { label: `${days}d left`, color: 'warning' };
    return { label: 'Valid', color: 'success' };
};
