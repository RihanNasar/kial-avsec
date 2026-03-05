// KIAL AVSEC Mobile — V3 Empty State
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import theme from '../../theme';

const EmptyState = ({ icon = 'file-tray-outline', title, message, action }) => (
    <View style={styles.container}>
        <View style={styles.iconWrap}>
            <Ionicons name={icon} size={40} color={colors.textTertiary} />
        </View>
        <Text style={styles.title}>{title || 'No data found'}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
        {action && <View style={styles.actionWrap}>{action}</View>}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.huge,
        paddingHorizontal: spacing.xxl,
    },
    iconWrap: {
        width: 80,
        height: 80,
        borderRadius: theme.radius.xl,
        backgroundColor: colors.glassBg,
        borderWidth: 1,
        borderColor: colors.glassBorderSubtle,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.semibold,
        color: colors.textPrimary,
        textAlign: 'center',
        fontFamily: typography.family,
    },
    message: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        fontFamily: typography.family,
        lineHeight: 20,
    },
    actionWrap: {
        marginTop: spacing.lg,
    },
});

export default EmptyState;
