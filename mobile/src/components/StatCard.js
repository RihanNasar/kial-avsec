// KIAL AVSEC Mobile — V3 Bento-Style Stat Card
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import theme from '../theme';
import GlassCard from './ui/GlassCard';

const StatCard = ({ title, value, icon, iconColor = colors.accent, subtitle, style }) => (
    <GlassCard borderRadius={theme.radius.xl} style={[styles.cardWrapper, style]} noPadding>
        <View style={styles.cardInner}>
            <View style={[styles.iconWrap, { backgroundColor: iconColor + '0D' }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <Text style={styles.value}>{value ?? '—'}</Text>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
    </GlassCard>
);

const styles = StyleSheet.create({
    cardWrapper: {
        flex: 1,
        minWidth: 140,
    },
    cardInner: {
        padding: spacing.base,
        paddingTop: spacing.lg,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    value: {
        fontSize: typography.size.xxxl,
        fontWeight: typography.weight.black,
        color: colors.textPrimary,
        fontFamily: typography.family,
        letterSpacing: -1,
        marginBottom: 2,
    },
    title: {
        fontSize: typography.size.xs,
        fontWeight: typography.weight.semibold,
        color: colors.textSecondary,
        fontFamily: typography.family,
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: typography.size.xxs,
        color: colors.textTertiary,
        marginTop: 3,
        fontFamily: typography.family,
        fontWeight: typography.weight.medium,
    },
});

export default StatCard;
