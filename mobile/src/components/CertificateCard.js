// KIAL AVSEC Mobile - Certificate Card Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import Badge from './ui/Badge';
import { formatDate, getExpiryStatus } from '../utils/dateHelpers';

const CertificateCard = ({ certificate, onPress, showStaff = false }) => {
    const expiry = getExpiryStatus(certificate.validTo);

    const getStatusBadge = () => {
        if (certificate.status === 'PENDING') return { label: 'Pending', variant: 'pending' };
        if (certificate.status === 'REJECTED') return { label: 'Rejected', variant: 'danger' };

        // Approved — check expiry
        if (expiry.color === 'danger') return { label: expiry.label, variant: 'danger' };
        if (expiry.color === 'warning') return { label: expiry.label, variant: 'warning' };
        return { label: 'Valid', variant: 'success' };
    };

    const badge = getStatusBadge();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.card}
        >
            <View style={styles.header}>
                <View style={styles.iconWrap}>
                    <Ionicons name="document-text-outline" size={18} color={colors.accent} />
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
                    <Text style={styles.dateLabel}>From</Text>
                    <Text style={styles.dateValue}>{formatDate(certificate.validFrom)}</Text>
                </View>
                <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>To</Text>
                    <Text style={styles.dateValue}>{formatDate(certificate.validTo)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.base,
        marginBottom: spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.accentLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
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
        marginTop: 2,
        fontFamily: typography.family,
    },
    dates: {
        flexDirection: 'row',
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    dateItem: {
        flex: 1,
    },
    dateLabel: {
        fontSize: typography.size.xs,
        color: colors.textTertiary,
        fontFamily: typography.family,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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
