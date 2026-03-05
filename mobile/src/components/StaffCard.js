// KIAL AVSEC Mobile — V3 Staff Card
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import theme from '../theme';
import Badge from './ui/Badge';

const StaffCard = ({ staff, onPress, showEntity = false }) => {
    const certCount = staff.certificates?.length || 0;
    const isKial = staff.isKialStaff;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.card}
        >
            <View style={styles.row}>
                {/* Avatar */}
                <View style={[styles.avatar, isKial && styles.avatarKial]}>
                    <Text style={[styles.avatarText, isKial && styles.avatarTextKial]}>
                        {staff.fullName?.charAt(0)?.toUpperCase() || 'S'}
                    </Text>
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{staff.fullName}</Text>
                    <Text style={styles.designation} numberOfLines={1}>
                        {staff.designation || 'Staff Member'}
                    </Text>
                    {showEntity && staff.entity && (
                        <Text style={styles.entity} numberOfLines={1}>
                            {staff.entity.name}
                        </Text>
                    )}
                </View>

                {/* Right side */}
                <View style={styles.right}>
                    {isKial && <Badge label="KIAL" variant="info" size="sm" />}
                    <View style={styles.certCount}>
                        <Ionicons name="document-text-outline" size={13} color={colors.textTertiary} />
                        <Text style={styles.certText}>{certCount}</Text>
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
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...theme.shadow.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.sm,
        backgroundColor: colors.surfaceDim,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarKial: {
        backgroundColor: colors.primaryGlow,
    },
    avatarText: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.textSecondary,
        fontFamily: typography.family,
    },
    avatarTextKial: {
        color: colors.primary,
    },
    info: {
        flex: 1,
        marginRight: spacing.sm,
    },
    name: {
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        color: colors.textPrimary,
        fontFamily: typography.family,
    },
    designation: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
        marginTop: 2,
        fontFamily: typography.family,
    },
    entity: {
        fontSize: typography.size.xs,
        color: colors.primary,
        marginTop: 2,
        fontFamily: typography.family,
        fontWeight: typography.weight.medium,
    },
    right: {
        alignItems: 'flex-end',
        gap: 6,
    },
    certCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    certText: {
        fontSize: typography.size.xs,
        color: colors.textTertiary,
        fontFamily: typography.family,
    },
});

export default StaffCard;
