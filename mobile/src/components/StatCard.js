// KIAL AVSEC Mobile - V2 Neumorphic Stat Card
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import NeumorphicView from './ui/NeumorphicView';

const StatCard = ({ title, value, icon, iconColor = colors.accent, subtitle, style }) => (
    <NeumorphicView borderRadius={24} style={[styles.cardWrapper, style]}>
        <View style={styles.cardInner}>
            <View style={styles.headerRow}>
                <View style={[styles.iconWrap, { backgroundColor: iconColor + '15' }]}>
                    <Ionicons name={icon} size={22} color={iconColor} />
                </View>
            </View>
            <Text style={styles.value}>{value ?? '—'}</Text>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
    </NeumorphicView>
);

const styles = StyleSheet.create({
    cardWrapper: {
        flex: 1,
        minWidth: 140,
    },
    cardInner: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: spacing.sm,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    value: {
        fontSize: typography.size.display,
        fontWeight: typography.weight.black,
        color: colors.textPrimary,
        fontFamily: typography.family,
        letterSpacing: -1,
        marginBottom: 2,
    },
    title: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.bold,
        color: colors.textSecondary,
        fontFamily: typography.family,
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: typography.size.xs,
        color: colors.textTertiary,
        marginTop: 4,
        fontFamily: typography.family,
        fontWeight: typography.weight.medium,
    },
});

export default StatCard;
