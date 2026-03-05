// KIAL AVSEC Mobile — V3 Premium Entity Dashboard
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { BarChart } from 'react-native-gifted-charts';
import entityApi from '../../api/entityApi';
import StatCard from '../../components/StatCard';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import GlassCard from '../../components/ui/GlassCard';
import { colors, spacing, typography } from '../../theme';
import theme from '../../theme';

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await entityApi.getDashboard();
            setData(res.data.data);
        } catch (err) {
            console.error('Entity dashboard error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchDashboard(); }, []));

    // Entrance animations
    const headerAnim = useRef(new Animated.Value(0)).current;
    const card1Anim = useRef(new Animated.Value(0)).current;
    const card2Anim = useRef(new Animated.Value(0)).current;
    const card3Anim = useRef(new Animated.Value(0)).current;
    const card4Anim = useRef(new Animated.Value(0)).current;
    const chartAnim = useRef(new Animated.Value(0)).current;
    const actionsAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(100, [
            Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(card1Anim, { toValue: 1, damping: 14, stiffness: 180, useNativeDriver: true }),
            Animated.spring(card2Anim, { toValue: 1, damping: 14, stiffness: 180, useNativeDriver: true }),
            Animated.spring(card3Anim, { toValue: 1, damping: 14, stiffness: 180, useNativeDriver: true }),
            Animated.spring(card4Anim, { toValue: 1, damping: 14, stiffness: 180, useNativeDriver: true }),
            Animated.timing(chartAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(actionsAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    if (loading && !data) return <LoadingOverlay />;

    const stats = data || {};

    const chartData = [
        { value: stats.totalStaff || 0, label: 'Staff', frontColor: colors.accent },
        { value: stats.totalCertificates || 0, label: 'Certs', frontColor: colors.primary },
        { value: stats.expiringCertificates || 0, label: 'Expiring', frontColor: colors.warning },
        { value: stats.pendingCertificates || 0, label: 'Pending', frontColor: colors.danger },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboard(true); }} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Header ── */}
            <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
                <View style={styles.userInfo}>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.fullName || 'Entity Head'}</Text>
                    {stats.entityName && (
                        <View style={styles.entityBadge}>
                            <View style={styles.entityDot} />
                            <Text style={styles.entityLabel}>{stats.entityName}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={logout} activeOpacity={0.7}>
                    <View style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={22} color={colors.primary} />
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* ── Bento Stats ── */}
            <View style={styles.bentoGrid}>
                <Animated.View style={[styles.bentoHalf, { opacity: card1Anim, transform: [{ scale: card1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
                    <StatCard title="Active Staff" value={stats.totalStaff ?? 0} icon="people-outline" iconColor={colors.accent} />
                </Animated.View>
                <Animated.View style={[styles.bentoHalf, { opacity: card2Anim, transform: [{ scale: card2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
                    <StatCard title="Certificates" value={stats.totalCertificates ?? 0} icon="document-text-outline" iconColor={colors.primary} />
                </Animated.View>
            </View>
            <View style={styles.bentoGrid}>
                <Animated.View style={[styles.bentoHalf, { opacity: card3Anim, transform: [{ scale: card3Anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
                    <StatCard title="Expiring Soon" value={stats.expiringCertificates ?? 0} icon="alert-circle-outline" iconColor={colors.warning} subtitle="Next 30 days" />
                </Animated.View>
                <Animated.View style={[styles.bentoHalf, { opacity: card4Anim, transform: [{ scale: card4Anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
                    <StatCard title="Awaiting Action" value={stats.pendingCertificates ?? 0} icon="time-outline" iconColor={colors.danger} subtitle="Approvals" />
                </Animated.View>
            </View>

            {/* ── Entity Overview Chart ── */}
            <Animated.View style={{ opacity: chartAnim }}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionAccent} />
                    <Text style={styles.sectionTitle}>Entity Overview</Text>
                </View>
                <GlassCard borderRadius={theme.radius.xl} variant="elevated">
                    <View style={styles.chartInner}>
                        <BarChart
                            data={chartData}
                            barWidth={32}
                            spacing={28}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10, fontFamily: typography.family }}
                            noOfSections={3}
                            maxValue={Math.max(...chartData.map(d => d.value), 5) * 1.2}
                            isAnimated
                            animationDuration={1200}
                        />
                    </View>
                </GlassCard>
            </Animated.View>

            {/* ── Quick Actions ── */}
            <Animated.View style={{ opacity: actionsAnim }}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionAccent} />
                    <Text style={styles.sectionTitle}>Dashboard Actions</Text>
                </View>
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => navigation.navigate('StaffTab')}>
                        <GlassCard borderRadius={theme.radius.lg} noPadding>
                            <View style={styles.actionInner}>
                                <View style={[styles.actionIcon, { backgroundColor: colors.accentSoft }]}>
                                    <Ionicons name="people" size={24} color={colors.accent} />
                                </View>
                                <Text style={styles.actionLabel}>My Staff</Text>
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => navigation.navigate('CertificatesTab')}>
                        <GlassCard borderRadius={theme.radius.lg} noPadding>
                            <View style={styles.actionInner}>
                                <View style={[styles.actionIcon, { backgroundColor: colors.primaryGlow }]}>
                                    <Ionicons name="document-text" size={24} color={colors.primary} />
                                </View>
                                <Text style={styles.actionLabel}>Certificates</Text>
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <View style={{ height: spacing.thumbZone }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.screenPadding,
        paddingTop: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sectionGap,
    },
    userInfo: {
        flex: 1,
        paddingRight: spacing.md,
    },
    greeting: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        fontFamily: typography.family,
        fontWeight: typography.weight.medium,
    },
    userName: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        fontFamily: typography.family,
        marginTop: 4,
        letterSpacing: -0.5,
    },
    entityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    entityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginRight: spacing.xs,
    },
    entityLabel: {
        fontSize: typography.size.sm,
        color: colors.primary,
        fontWeight: typography.weight.semibold,
        fontFamily: typography.family,
    },
    logoutBtn: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.md,
        backgroundColor: colors.glassBg,
        borderWidth: 1,
        borderColor: colors.glassBorderSubtle,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bentoGrid: {
        flexDirection: 'row',
        gap: spacing.bentoGap,
        marginBottom: spacing.bentoGap,
    },
    bentoHalf: { flex: 1 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sectionGap,
        marginBottom: spacing.md,
    },
    sectionAccent: {
        width: 3,
        height: 18,
        backgroundColor: colors.primary,
        borderRadius: 2,
        marginRight: spacing.sm,
    },
    sectionTitle: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        fontFamily: typography.family,
        letterSpacing: -0.2,
    },
    chartInner: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: spacing.bentoGap,
    },
    actionCard: { flex: 1 },
    actionInner: {
        padding: spacing.md,
        alignItems: 'center',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    actionLabel: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.semibold,
        color: colors.textPrimary,
        fontFamily: typography.family,
    },
});

export default DashboardScreen;
