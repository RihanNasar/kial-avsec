// KIAL AVSEC Mobile - V2 Neumorphic Animated Login Screen
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import KialLogo from '../../components/ui/KialLogo';
import NeumorphicView from '../../components/ui/NeumorphicView';
import { colors, spacing, typography } from '../../theme';

const { height: windowHeight } = Dimensions.get('window');

const LoginScreen = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }
        if (!password) {
            setError('Please enter your password');
            return;
        }
        setError('');
        setLoading(true);

        const result = await login(email.trim().toLowerCase(), password);

        if (!result.success) {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Subtle V2 Background Decorations */}
            <View style={styles.redGlow} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboard}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Banner - SVG Logo directly integrated */}
                    <Animated.View
                        entering={ZoomIn.delay(100).duration(500).springify().damping(15).stiffness(200)}
                        style={styles.brandSection}
                    >
                        {/* The Logo sits on a soft Neumorphic pedestal */}
                        <NeumorphicView borderRadius={100} style={styles.logoContainer}>
                            <View style={styles.logoInner}>
                                <KialLogo width={80} height={80} color={colors.textPrimary} />
                            </View>
                        </NeumorphicView>
                        <Text style={styles.logoTitle}>K I A L</Text>
                        <Text style={styles.title}>AVSEC System</Text>
                        <Text style={styles.subtitle}>Securing Tomorrow's Skies</Text>
                    </Animated.View>

                    {/* Elevated Form Card - Now Neumorphic */}
                    <Animated.View
                        entering={FadeInDown.delay(300).duration(500).springify().damping(20).stiffness(200)}
                    >
                        <NeumorphicView borderRadius={32} style={styles.formCard}>
                            <View style={styles.formInner}>
                                <Text style={styles.formTitle}>Welcome back</Text>
                                <Text style={styles.formSubtitle}>Verify your identity to proceed</Text>

                                {error ? (
                                    <Animated.View
                                        entering={ZoomIn.duration(300)}
                                        style={styles.errorBanner}
                                    >
                                        <Text style={styles.errorText}>{error}</Text>
                                    </Animated.View>
                                ) : null}

                                <Input
                                    label="Email Address"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="name@blr-airport.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    icon="mail-outline"
                                />

                                <Input
                                    label="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    secureTextEntry
                                    icon="lock-closed-outline"
                                    style={{ marginBottom: spacing.xl }}
                                />

                                <Button
                                    title="Authenticate"
                                    onPress={handleLogin}
                                    loading={loading}
                                    size="lg"
                                    variant="primary" // The V2 button now has physical tap animations
                                    icon={<Ionicons name="finger-print-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />}
                                    style={styles.loginButton}
                                />

                                <View style={styles.forgotWrapper}>
                                    <Text style={styles.forgotText}>Contact administrator for access</Text>
                                </View>
                            </View>
                        </NeumorphicView>
                    </Animated.View>

                    {/* Footer */}
                    <Text style={styles.footer}>
                        Kempegowda International Airport Limited © {new Date().getFullYear()}
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // MUST perfectly match the Neumorphic view surface for the 3D effect to work
        backgroundColor: colors.background,
    },
    redGlow: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: windowHeight * 0.4,
        backgroundColor: colors.primaryLight + '10', // Extremely faint red wash
    },
    keyboard: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.xxxl,
        paddingTop: spacing.huge,
        minHeight: windowHeight,
    },

    // Brand Section
    brandSection: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
        zIndex: 10,
    },
    logoContainer: {
        width: 140,
        height: 140,
        marginBottom: spacing.lg,
    },
    logoInner: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoTitle: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.black,
        color: colors.primary,
        fontFamily: typography.family,
        letterSpacing: 8,
        marginBottom: spacing.xxs,
        marginTop: 4,
    },
    title: {
        fontSize: typography.size.display,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        fontFamily: typography.family,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: typography.size.md,
        color: colors.textSecondary,
        fontFamily: typography.family,
        marginTop: spacing.xxs,
        fontWeight: typography.weight.medium,
    },

    // Form Card
    formCard: {
        marginBottom: spacing.xxxl,
    },
    formInner: {
        padding: spacing.cardPadding + 8,
        paddingTop: spacing.cardPadding + 16,
    },
    formTitle: {
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        fontFamily: typography.family,
        marginBottom: spacing.xxs,
        letterSpacing: -0.5,
    },
    formSubtitle: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        fontFamily: typography.family,
        marginBottom: spacing.xl,
        fontWeight: typography.weight.medium,
    },

    errorBanner: {
        backgroundColor: colors.dangerLight,
        padding: spacing.md,
        borderRadius: 14,
        marginBottom: spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.danger,
    },
    errorText: {
        fontSize: typography.size.sm,
        color: colors.danger,
        fontFamily: typography.family,
        fontWeight: typography.weight.semibold,
    },

    loginButton: {
        width: '100%',
        marginTop: spacing.md,
    },

    forgotWrapper: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    forgotText: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        fontFamily: typography.family,
        fontWeight: typography.weight.medium,
    },

    footer: {
        textAlign: 'center',
        fontSize: typography.size.xs,
        color: colors.textTertiary,
        fontFamily: typography.family,
        fontWeight: typography.weight.medium,
        letterSpacing: 0.2,
    },
});

export default LoginScreen;
