// KIAL AVSEC Mobile - Theme Index
import colors from './colors';
import spacing from './spacing';
import typography from './typography';

const theme = {
    colors,
    spacing,
    typography,

    // Border radius
    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        full: 999,
    },

    // Shadow presets
    shadow: {
        sm: {
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 1,
            shadowRadius: 3,
            elevation: 2,
        },
        md: {
            shadowColor: colors.shadowDark,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: colors.shadowDark,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};

export default theme;
export { colors, spacing, typography };
