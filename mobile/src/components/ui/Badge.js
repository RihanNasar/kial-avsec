// KIAL AVSEC Mobile - Badge / Status Badge Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

/**
 * @param {string} variant - 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending'
 */
const Badge = ({ label, variant = 'neutral', size = 'sm', style }) => {
    const variants = {
        success: { bg: colors.successLight, text: colors.success },
        warning: { bg: colors.warningLight, text: colors.warning },
        danger: { bg: colors.dangerLight, text: colors.danger },
        info: { bg: colors.accentLight, text: colors.accent },
        neutral: { bg: colors.borderLight, text: colors.textSecondary },
        pending: { bg: '#FEF9C3', text: '#A16207' },
    };

    const sizes = {
        sm: { paddingV: 3, paddingH: 8, fontSize: 10 },
        md: { paddingV: 4, paddingH: 10, fontSize: 11 },
        lg: { paddingV: 6, paddingH: 14, fontSize: 12 },
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
            <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
        borderRadius: 6,
    },
    text: {
        fontFamily: typography.family,
        fontWeight: typography.weight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default Badge;
