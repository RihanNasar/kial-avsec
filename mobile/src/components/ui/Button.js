// KIAL AVSEC Mobile — V3 Glassmorphic Button Component
import React, { useRef } from 'react';
import { Text, ActivityIndicator, StyleSheet, Pressable, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../../theme';
import theme from '../../theme';

/**
 * @param {'primary' | 'secondary' | 'danger' | 'ghost'} variant
 * @param {'sm' | 'md' | 'lg'} size
 */
const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    style,
}) => {
    const isDisabled = disabled || loading;

    const sizeStyles = {
        sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: typography.size.sm, radius: 12 },
        md: { paddingVertical: 16, paddingHorizontal: 28, fontSize: typography.size.md, radius: 16 },
        lg: { paddingVertical: 18, paddingHorizontal: 36, fontSize: typography.size.lg, radius: 20 },
    };

    const s = sizeStyles[size];

    const scale = useRef(new Animated.Value(1)).current;

    const animatedStyle = { transform: [{ scale }] };

    const handlePressIn = () => {
        if (!isDisabled) Animated.spring(scale, { toValue: 0.96, damping: 15, stiffness: 300, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        if (!isDisabled) Animated.spring(scale, { toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true }).start();
    };

    const textColor =
        variant === 'primary' || variant === 'danger'
            ? colors.textInverse
            : variant === 'secondary'
                ? colors.primary
                : colors.textSecondary;

    const renderContent = () => (
        <View style={[styles.inner, { paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal }]}>
            {loading ? (
                <ActivityIndicator size="small" color={textColor} />
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <Text style={[styles.text, { color: textColor, fontSize: s.fontSize, marginLeft: icon ? spacing.xs : 0 }]}>
                        {title}
                    </Text>
                </>
            )}
        </View>
    );

    if (variant === 'primary') {
        return (
            <Animated.View style={[animatedStyle, style, isDisabled && styles.disabled]}>
                <Pressable
                    onPress={isDisabled ? undefined : onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <LinearGradient
                        colors={[colors.gradientRedStart, colors.gradientRedEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.gradient, { borderRadius: s.radius }, !isDisabled && theme.shadow.colored]}
                    >
                        {renderContent()}
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        );
    }

    const bgStyle =
        variant === 'danger'
            ? { backgroundColor: colors.danger }
            : variant === 'secondary'
                ? { backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.border }
                : { backgroundColor: 'transparent' };

    return (
        <Animated.View
            style={[
                styles.base,
                bgStyle,
                { borderRadius: s.radius },
                variant === 'danger' && !isDisabled && { ...theme.shadow.sm, shadowColor: colors.danger },
                style,
                animatedStyle,
                isDisabled && styles.disabled,
            ]}
        >
            <Pressable
                onPress={isDisabled ? undefined : onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                {renderContent()}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    base: {},
    gradient: {
        overflow: 'hidden',
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        letterSpacing: 0.3,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default Button;
