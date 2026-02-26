// KIAL AVSEC Mobile - Typography
// Uses Poppins font family (matches web app)
import { Platform } from 'react-native';

const fontFamily = Platform.select({
    ios: 'Poppins',
    android: 'Poppins',
    default: 'Poppins',
});

export default {
    family: fontFamily,

    // Font sizes
    size: {
        xs: 11,
        sm: 13,
        base: 15,
        md: 17,
        lg: 19,
        xl: 22,
        xxl: 26,
        xxxl: 32,
        display: 36,
        displayLarge: 42,
    },

    // Font weights (Poppins-specific)
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
        normal: 1.5,
        relaxed: 1.75,
    },
};
