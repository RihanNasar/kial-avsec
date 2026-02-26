// KIAL AVSEC Mobile - Design System Colors
// Premium palette: Crisp whites, deep navy, vibrant KIAL red #E51D28

export default {
    // Primary brand (Vibrant KIAL Red)
    primary: '#E51D28',
    primaryLight: '#FF4D55',
    primaryDark: '#B9141D',     // Used for active/pressed states

    // Accent (Deep Navy/Black)
    accent: '#0B132B',
    accentLight: '#1C2541',

    // Brand red (legacy compat)
    red: '#E51D28',
    redLight: '#FEE2E2',

    // Neutral / Backgrounds
    white: '#FFFFFF',
    // Neumorphism requires a slightly off-white background to allow for pure white highlights
    background: '#F0F2F5',      // A beautiful cool grey base for Neumorphism
    surface: '#F0F2F5',         // Cards should match background for the "extruded/pressed" look
    surfaceVariant: '#E2E8F0',  // Inputs, distinct areas
    border: '#E2E8F0',          // Soft border
    borderLight: '#F1F5F9',
    divider: '#E2E8F0',

    // Text
    textPrimary: '#1E293B',     // Deep slate
    textSecondary: '#64748B',   // Readable slate gray
    textTertiary: '#94A3B8',
    textInverse: '#FFFFFF',

    // Status
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',

    // Standard Shadows
    shadow: 'rgba(15, 23, 42, 0.08)',
    shadowDark: 'rgba(15, 23, 42, 0.15)',

    // V2 Neumorphic Shadows (Soft UI)
    // Neumorphism uses two opposing shadows: a dark drop shadow for depth, and a white inset/highlight for the raised edge
    neuLight: '#FFFFFF', // The top-left highlight (simulating a light source)
    neuDark: '#D1D9E6',  // The bottom-right depth shadow 
};
