// KIAL AVSEC Mobile — NeumorphicView (DEPRECATED)
// This component is no longer used. It has been replaced by GlassCard.
// Kept for reference only.
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function NeumorphicView({ children, style, inset = false, borderRadius = 16 }) {
    return (
        <View style={[styles.container, style, { borderRadius }]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
    },
});
