// KIAL AVSEC Mobile - Loading Overlay
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

const LoadingOverlay = ({ message = 'Loading...' }) => (
    <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>{message}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 24,
    },
    message: {
        marginTop: 16,
        fontSize: typography.size.base,
        color: colors.textSecondary,
        fontFamily: typography.family,
    },
});

export default LoadingOverlay;
