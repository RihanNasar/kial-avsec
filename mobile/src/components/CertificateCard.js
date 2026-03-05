// KIAL AVSEC Mobile — V3 Certificate Card
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import theme from '../theme';
import Badge from './ui/Badge';
import { formatDate, getExpiryStatus } from '../utils/dateHelpers';

const CertificateCard = ({ certificate, onPress, showStaff = false }) => {
    const expiry = getExpiryStatus(certificate.validTo);

    const getStatusBadge = () => {
        if (certificate.status === 'PENDING') return { label: 'Pending', variant: 'pending' };
        if (certificate.status === 'REJECTED') return { label: 'Rejected', variant: 'danger' };
        if (expiry.color === 'danger') return { label: expiry.label, variant: 'danger' };
        if (expiry.color === 'warning') return { label: expiry.label, variant: 'warning' };
        return { label: 'Valid', variant: 'success' };
    };

    const badge = getStatusBadge();

    // Accent line color by status
    const accentColor =
        badge.variant === 'danger' ? colors.danger
            : badge.variant === 'warning' ? colors.warning
                : badge.variant === 'pending' ? '#D97706'
                    : colors.success;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.card}
        >
            {/* Left accent line */}
            <View style={[styles.accentLine, { backgroundColor: accentColor }]} />

            <View style={styles.cardContent}>
                <View style={styles.header}>
                    <View style={styles.iconWrap}>
                        <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.type} numberOfLines={1}>{certificate.type}</Text>
                        {showStaff && certificate.staff && (
                            <Text style={styles.staffName} numberOfLines={1}>{certificate.staff.fullName}</Text>
                        )}
                    </View>
                    <Badge label={badge.label} variant={badge.variant} />
                </View>

                <View style={styles.dates}>
                    <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>FROM</Text>
                        <Text style={styles.dateValue}>{formatDate(certificate.validFrom)}</Text>
                    </View>
                    <View style={styles.dateDivider} />
                    <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>TO</Text>
                        <Text style={styles.dateValue}>{formatDate(certificate.validTo)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.glassBgStrong,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorderSubtle,
        marginBottom: spacing.sm,
        flexDirection: 'row',
        overflow: 'hidden',
        ...theme.shadow.sm,
    },
    accentLine: {
        width: 3,
    },
    cardContent: {
        flex: 1,
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.xs,
        backgroundColor: colors.primaryGlow,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    headerText: {
        flex: 1,
        marginRight: spacing.sm,
    },
    type: {
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        color: colors.textPrimary,
        fontFamily: typography.family,
    },
    staffName: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
        marginTop: 1,
        fontFamily: typography.family,
    },
    dates: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    dateItem: {
        flex: 1,
    },
    dateDivider: {
        width: 1,
        height: 24,
        backgroundColor: colors.borderLight,
        marginHorizontal: spacing.sm,
    },
    dateLabel: {
        fontSize: typography.size.xxs,
        color: colors.textTertiary,
        fontFamily: typography.family,
        fontWeight: typography.weight.semibold,
        letterSpacing: 0.8,
    },
    dateValue: {
        fontSize: typography.size.sm,
        color: colors.textPrimary,
        fontWeight: typography.weight.medium,
        fontFamily: typography.family,
        marginTop: 2,
    },
});

export default CertificateCard;
