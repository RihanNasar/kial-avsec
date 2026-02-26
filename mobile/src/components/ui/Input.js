// KIAL AVSEC Mobile - V2 Neumorphic Input Component
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import NeumorphicView from './NeumorphicView';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'none',
    multiline = false,
    editable = true,
    icon,
    style,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = secureTextEntry;

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <NeumorphicView inset={true} borderRadius={16} style={styles.neuWrapper}>
                <View
                    style={[
                        styles.inputWrapper,
                        isFocused && styles.inputFocused,
                        error && styles.inputError,
                        !editable && styles.disabled
                    ]}
                >
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={isFocused ? colors.primary : colors.textTertiary}
                            style={styles.icon}
                        />
                    )}
                    <TextInput
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textTertiary}
                        secureTextEntry={isPassword && !showPassword}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        multiline={multiline}
                        editable={editable}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={[
                            styles.input,
                            multiline && styles.multiline,
                            icon && styles.inputWithIcon,
                        ]}
                    />
                    {isPassword && (
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={colors.textTertiary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </NeumorphicView>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.semibold,
        color: colors.textSecondary,
        marginBottom: 8,
        fontFamily: typography.family,
        letterSpacing: 0.3,
    },
    neuWrapper: {
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        // Background is managed by NeumorphicView inset simulation, but we keep a tint
        backgroundColor: 'transparent',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    inputFocused: {
        borderColor: colors.primaryLight,
        // On focus, give it a solid white background inside the shadow
        backgroundColor: colors.surface,
    },
    inputError: {
        borderColor: colors.danger,
        backgroundColor: colors.dangerLight + '20',
    },
    disabled: {
        opacity: 0.6,
    },
    icon: {
        marginLeft: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 18,
        paddingHorizontal: 20,
        fontSize: typography.size.base,
        color: colors.textPrimary,
        fontFamily: typography.family,
    },
    inputWithIcon: {
        paddingLeft: 10,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 16,
    },
    eyeButton: {
        padding: 16,
    },
    errorText: {
        fontSize: typography.size.sm,
        color: colors.danger,
        marginTop: 6,
        fontFamily: typography.family,
        fontWeight: typography.weight.medium,
    },
});

export default Input;
