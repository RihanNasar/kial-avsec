// KIAL AVSEC Mobile - V2 Animated Neumorphic Entity Dashboard
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { BarChart } from 'react-native-gifted-charts';
import entityApi from '../../api/entityApi';
import StatCard from '../../components/StatCard';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import NeumorphicView from '../../components/ui/NeumorphicView';
import { colors, spacing, typography } from '../../theme';

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
            {/* Header */}
            <Animated.View
                entering={FadeInDown.duration(500)}
                style={styles.header}
            >
                <View style={styles.userInfo}>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.fullName || 'Entity Head'}</Text>
                    {stats.entityName && <Text style={styles.entityLabel}>{stats.entityName}</Text>}
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
                    <NeumorphicView borderRadius={16} style={styles.logoutNeu}>
                        <Ionicons name="log-out-outline" size={24} color={colors.primary} />
                    </NeumorphicView>
                </TouchableOpacity>
            </Animated.View>

            {/* Stats - Staggered */}
            <View style={styles.statsRow}>
                <Animated.View entering={ZoomIn.delay(100).duration(500)} style={{ flex: 1 }}>
                    <StatCard title="Active Staff" value={stats.totalStaff ?? 0} icon="people-outline" iconColor={colors.accent} />
                </Animated.View>
                <Animated.View entering={ZoomIn.delay(200).duration(500)} style={{ flex: 1 }}>
                    <StatCard title="Certificates" value={stats.totalCertificates ?? 0} icon="document-text-outline" iconColor={colors.primary} />
                </Animated.View>
            </View>

            <View style={styles.statsRow}>
                <Animated.View entering={ZoomIn.delay(300).duration(500)} style={{ flex: 1 }}>
                    <StatCard title="Expiring Soon" value={stats.expiringCertificates ?? 0} icon="alert-circle-outline" iconColor={colors.warning} subtitle="Next 30 days" />
                </Animated.View>
                <Animated.View entering={ZoomIn.delay(400).duration(500)} style={{ flex: 1 }}>
                    <StatCard title="Awaiting Action" value={stats.pendingCertificates ?? 0} icon="time-outline" iconColor={colors.danger} subtitle="Approvals" />
                </Animated.View>
            </View>

            {/* Data Visualization Chart */}
            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
                <Text style={styles.sectionTitle}>Entity Overview</Text>
                <NeumorphicView borderRadius={24} style={styles.chartCardWrapper}>
                    <View style={styles.chartCardInner}>
                        <BarChart
                            data={chartData}
                            barWidth={32}
                            spacing={28}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
                            noOfSections={3}
                            maxValue={Math.max(...chartData.map(d => d.value), 5) * 1.2}
                            isAnimated
                            animationDuration={1500}
                        />
                    </View>
                </NeumorphicView>
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                <Text style={styles.sectionTitle}>Dashboard Actions</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => navigation.navigate('StaffTab')}>
                        <NeumorphicView borderRadius={20} style={styles.actionNeu}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.accentLight + '15' }]}>
                                <Ionicons name="people" size={26} color={colors.accent} />
                            </View>
                            <Text style={styles.actionLabel}>My Staff</Text>
                        </NeumorphicView>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={() => navigation.navigate('CertificatesTab')}>
                        <NeumorphicView borderRadius={20} style={styles.actionNeu}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight + '15' }]}>
                                <Ionicons name="document-text" size={26} color={colors.primary} />
                            </View>
                            <Text style={styles.actionLabel}>Certificates</Text>
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
    entityLabel: {
        fontSize: typography.size.sm,
        color: colors.primary,
        fontWeight: typography.weight.bold,
        fontFamily: typography.family,
        marginTop: 6,
        letterSpacing: 0.2,
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
