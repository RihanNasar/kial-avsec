// KIAL AVSEC Mobile — Typography (V3 Refined Hierarchy)
// Poppins — clean, modern, mobile-optimized
import { Platform } from 'react-native';

const fontFamily = Platform.select({
    ios: 'Poppins',
    android: 'Poppins',
    default: 'Poppins',
});

export default {
    family: fontFamily,

    // Font sizes — tightened scale for mobile clarity
    size: {
        xxs: 10,
        xs: 11,
        sm: 13,
        base: 15,
        md: 17,
        lg: 20,
        xl: 24,
        xxl: 28,
        xxxl: 34,
        display: 40,
        displayLarge: 48,
    },

    // Font weights
    weight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
    },

    // Line heights
    lineHeight: {
        tight: 1.15,
        snug: 1.3,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Letter spacing presets
    tracking: {
        tighter: -1.5,
        tight: -0.5,
        normal: 0,
        wide: 0.3,
        wider: 0.6,
        widest: 1.2,
        ultraWide: 3,
    },
};
