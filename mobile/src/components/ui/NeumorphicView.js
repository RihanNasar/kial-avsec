import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import colors from '../../theme/colors';

/**
 * A wrapper component that applies Soft UI (Neumorphism) styling.
 * It uses a dark drop shadow for depth and a white highlight for the raised edge.
 */
export default function NeumorphicView({ children, style, inset = false, borderRadius = 16 }) {
    // In React Native, true inset shadows are notoriously difficult without SVG masks.
    // For V2, we simulate the "extruded/pressed" look by manipulating background colors and shadow opacity.

    return (
        <View style={[styles.container, style, { borderRadius }]}>
            {/* Top-Left Highlight (Light Source) */}
            <View
                style={[
                    StyleSheet.absoluteFillObject,
                    styles.lightShadow,
                    { borderRadius },
                    inset && styles.insetLight
                ]}
            />

            {/* Bottom-Right Depth (Shadow) */}
            <View
                style={[
                    StyleSheet.absoluteFillObject,
                    styles.darkShadow,
                    { borderRadius },
                    inset && styles.insetDark
                ]}
            />

            {/* Content Container */}
            <View style={[styles.content, { borderRadius }, inset && styles.insetContent]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        position: 'relative',
    },
    content: {
        backgroundColor: 'transparent',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
    },
    lightShadow: {
        backgroundColor: colors.surface,
        ...Platform.select({
            ios: {
                shadowColor: colors.neuLight,
                shadowOffset: { width: -4, height: -4 },
                shadowOpacity: 1,
                shadowRadius: 8,
            },
            android: {
                // Android elevation doesn't easily support negative offsets (highlights)
                // We fake a highlight stroke for Android
                borderWidth: 1,
                borderColor: colors.neuLight,
                borderLeftWidth: 2,
                borderTopWidth: 2,
            },
        }),
    },
    darkShadow: {
        backgroundColor: 'transparent', // The light shadow is the base layer
        ...Platform.select({
            ios: {
                shadowColor: colors.neuDark,
                shadowOffset: { width: 5, height: 5 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
            },
            android: {
                elevation: 8,
                shadowColor: colors.neuDark,
            },
        }),
    },
    // INSET SIMULATIONS 
    // True inset shadows require SVG, but we can simulate a "pressed" container
    insetLight: {
        ...Platform.select({
            ios: {
                shadowColor: colors.neuDark, // Reverse colors for inset illusion
                shadowOffset: { width: insetFakeOffset() ? -2 : 0, height: -2 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
            },
            android: {
                borderWidth: 1,
                borderColor: colors.neuDark,
                borderTopWidth: 2,
                borderLeftWidth: 2,
                elevation: 0,
            },
        }),
    },
    insetDark: {
        ...Platform.select({
            ios: {
                shadowColor: colors.neuLight, // Reverse colors
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 3,
            },
            android: {
                elevation: 0,
            },
        }),
    },
    insetContent: {
        backgroundColor: colors.surfaceVariant, // Slightly darker surface when "pressed"
    }
});

function insetFakeOffset() { return true; }
