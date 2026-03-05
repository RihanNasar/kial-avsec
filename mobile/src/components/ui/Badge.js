// KIAL AVSEC Mobile — V3 Badge / Status Pill
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

/**
 * @param {'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending'} variant
 */
const Badge = ({ label, variant = 'neutral', size = 'sm', style }) => {
    const variants = {
        success: { bg: colors.successLight, text: colors.success, dot: colors.success },
        warning: { bg: colors.warningLight, text: colors.warning, dot: colors.warning },
        danger: { bg: colors.dangerLight, text: colors.danger, dot: colors.danger },
        info: { bg: colors.infoLight, text: colors.info, dot: colors.info },
        neutral: { bg: colors.surfaceDim, text: colors.textSecondary, dot: colors.textTertiary },
        pending: { bg: '#FFFBEB', text: '#A16207', dot: '#D97706' },
    };

    const sizes = {
        sm: { paddingV: 4, paddingH: 10, fontSize: 10, dotSize: 5 },
        md: { paddingV: 5, paddingH: 12, fontSize: 11, dotSize: 6 },
        lg: { paddingV: 6, paddingH: 14, fontSize: 12, dotSize: 6 },
    };

    const v = variants[variant] || variants.neutral;
    const s = sizes[size] || sizes.sm;

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: v.bg,
                    paddingVertical: s.paddingV,
                    paddingHorizontal: s.paddingH,
                },
                style,
            ]}
        >
            <View style={[styles.dot, { backgroundColor: v.dot, width: s.dotSize, height: s.dotSize }]} />
            <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    dot: {
        borderRadius: 999,
    },
    text: {
        fontFamily: typography.family,
        fontWeight: typography.weight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
});

export default Badge;
