// KIAL AVSEC Mobile - V2 Neumorphic Animated Button Component
import React, { useMemo } from 'react';
import { Text, ActivityIndicator, StyleSheet, Platform, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
import { colors, spacing, typography } from '../../theme';

/**
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'ghost' | 'neumorphic'
 * @param {string} size - 'sm' | 'md' | 'lg'
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

    const variantStyles = {
        primary: {
            bg: colors.primary,
            text: colors.textInverse,
            isNeumorphic: false,
        },
        neumorphic: {
            bg: colors.surface,
            text: colors.primary,
            isNeumorphic: true,
        },
        secondary: {
            bg: 'transparent',
            border: colors.border,
            text: colors.textPrimary,
            isNeumorphic: false,
        },
        danger: {
            bg: colors.danger,
            text: colors.textInverse,
            isNeumorphic: false,
        },
        ghost: {
            bg: 'transparent',
            text: colors.textSecondary,
            isNeumorphic: false,
        },
    };

    const sizeStyles = {
        sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: typography.size.sm, radius: 12 },
        md: { paddingVertical: 16, paddingHorizontal: 24, fontSize: typography.size.md, radius: 16 },
        lg: { paddingVertical: 20, paddingHorizontal: 32, fontSize: typography.size.lg, radius: 20 },
    };

    const v = variantStyles[variant];
    const s = sizeStyles[size];

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    const handlePressIn = () => {
        if (!isDisabled) {
            scale.value = withSpring(0.95);
            opacity.value = withSpring(0.9);
        }
    };

    const handlePressOut = () => {
        if (!isDisabled) {
            scale.value = withSpring(1);
            opacity.value = withSpring(1);
        }
    };

    return (
        <AnimatedPressable
            onPress={isDisabled ? undefined : onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.base,
                // Apply Neumorphic Shadows if variant requests it
                v.isNeumorphic && !isDisabled && styles.neumorphicShadows,
                // Fallback standard elevation for classic variants
                variant === 'primary' && !isDisabled && styles.primaryElevated,
                {
                    backgroundColor: v.bg,
                    paddingVertical: s.paddingVertical,
                    paddingHorizontal: s.paddingHorizontal,
                    borderRadius: s.radius,
                    borderWidth: v.border ? 1 : 0,
                    borderColor: v.border || 'transparent',
                },
                style,
                animatedStyle,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={v.text} />
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <Text
                        style={[
                            styles.text,
                            {
                                color: v.text,
                                fontSize: s.fontSize,
                                marginLeft: icon ? spacing.xs : 0,
                            },
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        letterSpacing: 0.5,
    },
    primaryElevated: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    neumorphicShadows: {
        ...Platform.select({
            ios: {
                shadowColor: colors.neuDark,
                shadowOffset: { width: 6, height: 6 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
            },
            android: {
                elevation: 8,
                shadowColor: colors.neuDark,
            },
        }),
    }
});

export default Button;
