// KIAL AVSEC Mobile — Theme Index (V3 Glassmorphic)
import colors from './colors';
import spacing from './spacing';
import typography from './typography';

const theme = {
    colors,
    spacing,
    typography,

    // Border radius — modern, generous
    radius: {
        xs: 8,
        sm: 12,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 28,
        full: 999,
    },

    // Shadow presets — soft, diffused, premium
    shadow: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 8,
        },
        colored: {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 6,
        },
    },

    // Glassmorphic container presets
    glass: {
        card: {
            backgroundColor: colors.glassBg,
            borderWidth: 1,
            borderColor: colors.glassBorderSubtle,
        },
        cardStrong: {
            backgroundColor: colors.glassBgStrong,
            borderWidth: 1,
            borderColor: colors.glassBorder,
        },
        redTint: {
            backgroundColor: colors.glassRedTint,
            borderWidth: 1,
            borderColor: colors.glassBorderSubtle,
        },
    },
};

export default theme;
export { colors, spacing, typography };
