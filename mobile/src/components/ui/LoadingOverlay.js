// KIAL AVSEC Mobile — V3 Loading Overlay
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

const LoadingOverlay = ({ message = 'Loading...' }) => (
    <View style={styles.container}>
        <View style={styles.spinnerWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <Text style={styles.message}>{message}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: spacing.xxl,
    },
    spinnerWrap: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: colors.glassBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    message: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        fontFamily: typography.family,
        fontWeight: typography.weight.medium,
        letterSpacing: 0.2,
    },
});

export default LoadingOverlay;
