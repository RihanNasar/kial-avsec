// KIAL AVSEC Mobile - V2 Animated Neumorphic CSO Dashboard
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { BarChart } from 'react-native-gifted-charts';
import adminApi from '../../api/adminApi';
import StatCard from '../../components/StatCard';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import Badge from '../../components/ui/Badge';
import NeumorphicView from '../../components/ui/NeumorphicView';
import { colors, spacing, typography } from '../../theme';
import { useFocusEffect } from '@react-navigation/native';
import { getExpiryStatus } from '../../utils/dateHelpers';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await adminApi.getDashboard();
            setData(res.data.data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDashboard();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboard(true);
    };

    if (loading && !data) return <LoadingOverlay />;

    const stats = data || {};

    // Prepare chart data for V2
    const chartData = [
        { value: stats.totalEntities || 0, label: 'Entities', frontColor: colors.primary },
        { value: stats.totalStaff || 0, label: 'Staff', frontColor: colors.accent },
        { value: stats.expiringCertificates || 0, label: 'Expiring', frontColor: colors.warning },
        { value: stats.pendingApprovals || 0, label: 'Pending', frontColor: colors.danger },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                <View style={styles.userInfo}>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.fullName || 'Chief Security Officer'}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
                    <NeumorphicView borderRadius={16} style={styles.logoutNeu}>
                        <Ionicons name="log-out-outline" size={24} color={colors.primary} />
                    </NeumorphicView>
                </TouchableOpacity>
            </Animated.View>

            {/* Stats Grid - Staggered entrance */}
            <View style={styles.statsRow}>
                <Animated.View entering={ZoomIn.delay(100).duration(500)} style={{ flex: 1 }}>
                    <StatCard title="Entities Managed" value={stats.totalEntities ?? 0} icon="business-outline" iconColor={colors.primary} />
                </Animated.View>
                <Animated.View entering={ZoomIn.delay(200).duration(500)} style={{ flex: 1 }}>
                    <StatCard title="Active Staff" value={stats.totalStaff ?? 0} icon="people-outline" iconColor={colors.accent} />
                </Animated.View>
            </View>

            <View style={styles.statsRow}>
                <Animated.View entering={ZoomIn.delay(300).duration(500)} style={{ flex: 1 }}>
                    <StatCard title="Expiring Soon" value={stats.expiringCertificates ?? 0} icon="alert-circle-outline" iconColor={colors.warning} subtitle="Next 30 days" />
                </Animated.View>
                <Animated.View entering={ZoomIn.delay(400).duration(500)} style={{ flex: 1 }}>
                    <StatCard title="Awaiting Action" value={stats.pendingApprovals ?? 0} icon="time-outline" iconColor={colors.danger} subtitle="Approvals" />
                </Animated.View>
            </View>

            {/* Data Visualization Chart (V2 Feature) */}
            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
                <Text style={styles.sectionTitle}>System Overview</Text>
                <NeumorphicView borderRadius={24} style={styles.chartCardWrapper}>
                    <View style={styles.chartCardInner}>
                        <BarChart
                            data={chartData}
                            barWidth={28}
                            spacing={24}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
                            noOfSections={3}
                            maxValue={Math.max(...chartData.map(d => d.value), 10) * 1.2}
                            isAnimated // Gifted Charts built-in animation
                            animationDuration={1500}
                        />
                    </View>
                </NeumorphicView>
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.actionsRow}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => navigation.navigate('EntitiesTab')}>
                        <NeumorphicView borderRadius={20} style={styles.actionNeu}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight + '15' }]}>
                                <Ionicons name="business" size={26} color={colors.primary} />
                            </View>
                            <Text style={styles.actionLabel}>Entities</Text>
                        </NeumorphicView>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => navigation.navigate('StaffTab')}>
                        <NeumorphicView borderRadius={20} style={styles.actionNeu}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.accentLight + '15' }]}>
                                <Ionicons name="people" size={26} color={colors.accent} />
                            </View>
                            <Text style={styles.actionLabel}>Staff</Text>
                        </NeumorphicView>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => navigation.navigate('ApprovalsTab')}>
                        <NeumorphicView borderRadius={20} style={styles.actionNeu}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.warningLight + '20' }]}>
                                <Ionicons name="shield-checkmark" size={26} color={colors.warning} />
                            </View>
                            <Text style={styles.actionLabel}>Approvals</Text>
                        </NeumorphicView>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <View style={{ height: spacing.massive }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingTop: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xxl,
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
        letterSpacing: 0.2,
    },
    userName: {
        fontSize: typography.size.display,
        fontWeight: typography.weight.black,
        color: colors.textPrimary,
        fontFamily: typography.family,
        marginTop: 4,
        letterSpacing: -1,
    },
    logoutBtn: {
        width: 52,
        height: 52,
    },
    logoutNeu: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        fontFamily: typography.family,
        letterSpacing: -0.2,
        marginTop: spacing.xl,
        marginBottom: spacing.md,
    },
    chartCardWrapper: {
        width: '100%',
    },
    chartCardInner: {
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionCard: {
        flex: 1,
    },
    actionNeu: {
        padding: spacing.base,
        alignItems: 'center',
    },
    actionIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    actionLabel: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        fontFamily: typography.family,
        letterSpacing: 0.2,
    },
});

export default DashboardScreen;
