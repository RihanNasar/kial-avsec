// KIAL AVSEC Mobile - Entity Card Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import Badge from './ui/Badge';
import { isExpired, isExpiringSoon } from '../utils/dateHelpers';

const EntityCard = ({ entity, onPress }) => {
    const staffCount = entity.staffMembers?.length || entity._count?.staffMembers || 0;

    // Contract status
    const getContractBadge = () => {
        if (!entity.contractValidTo) return { label: 'No Contract', variant: 'neutral' };
        if (isExpired(entity.contractValidTo)) return { label: 'Expired', variant: 'danger' };
        if (isExpiringSoon(entity.contractValidTo, 30)) return { label: 'Expiring', variant: 'warning' };
        return { label: 'Active', variant: 'success' };
    };

    const badge = getContractBadge();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.card}
        >
            <View style={styles.header}>
                <View style={styles.iconWrap}>
                    <Ionicons name="business-outline" size={20} color={colors.red} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.name} numberOfLines={1}>{entity.name}</Text>
                    {entity.externalEntityCode && (
                        <Text style={styles.code} numberOfLines={1}>{entity.externalEntityCode}</Text>
                    )}
                </View>
                <Badge label={badge.label} variant={badge.variant} />
            </View>

            <View style={styles.footer}>
                <View style={styles.footerItem}>
                    <Ionicons name="people-outline" size={14} color={colors.textTertiary} />
                    <Text style={styles.footerText}>{staffCount} staff</Text>
                </View>
                {entity.ascoName && (
                    <View style={styles.footerItem}>
                        <Ionicons name="person-outline" size={14} color={colors.textTertiary} />
                        <Text style={styles.footerText} numberOfLines={1}>{entity.ascoName}</Text>
                    </View>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
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
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.redLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    headerText: {
        flex: 1,
        marginRight: spacing.sm,
    },
    name: {
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        color: colors.textPrimary,
        fontFamily: typography.family,
    },
    code: {
        fontSize: typography.size.xs,
        color: colors.textTertiary,
        marginTop: 2,
        fontFamily: typography.family,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        gap: spacing.base,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    footerText: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
        fontFamily: typography.family,
    },
});

export default EntityCard;
