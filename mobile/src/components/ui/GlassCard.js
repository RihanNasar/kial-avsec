// KIAL AVSEC Mobile — GlassCard (V3 Glassmorphic Container)
// Replaces NeumorphicView as the primary container component
import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme, { colors } from '../../theme';

/**
 * @param {'default' | 'elevated' | 'redTint'} variant
 */
export default function GlassCard({ children, style, variant = 'default', borderRadius, noPadding = false }) {
    const rad = borderRadius ?? theme.radius.lg;

    const variantStyle = variant === 'redTint'
        ? styles.redTint
        : variant === 'elevated'
            ? styles.elevated
            : styles.default;

    const shadowStyle = variant === 'elevated'
        ? theme.shadow.md
        : theme.shadow.sm;

    return (
        <View style={[styles.base, variantStyle, shadowStyle, { borderRadius: rad }, !noPadding && styles.padded, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
    },
    padded: {
        padding: theme.spacing.cardPadding,
    },
    default: {
        backgroundColor: colors.glassBg,
        borderWidth: 1,
        borderColor: colors.glassBorderSubtle,
    },
    elevated: {
        backgroundColor: colors.glassBgStrong,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    redTint: {
        backgroundColor: colors.glassRedTint,
        borderWidth: 1,
        borderColor: colors.glassBorderSubtle,
    },
});
