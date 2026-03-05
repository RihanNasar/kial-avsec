// KIAL AVSEC Mobile — V8 Detailed Red-Glass Dashboard with Notifications
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Platform,
    ActivityIndicator,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import { useAuth } from '../../context/AuthContext';
import { LineChart } from 'react-native-gifted-charts';
import adminApi from '../../api/adminApi';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48 - 16) / 2; // Exact 2-column grid calculation

export default function DashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

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

    // Smooth Entrance Animations
    const headerAnim = useRef(new Animated.Value(0)).current;
    const statsAnim = useRef(new Animated.Value(0)).current;
    const chartAnim = useRef(new Animated.Value(0)).current;
    const tasksAnim = useRef(new Animated.Value(0)).current;
    const activityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(150, [
            Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(statsAnim, { toValue: 1, damping: 15, stiffness: 150, useNativeDriver: true }),
            Animated.timing(chartAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(tasksAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(activityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const onRefresh = () => { 
        setRefreshing(true); 
        fetchDashboard(true); 
    };

    const stats = data || {};

    // Premium Curved Area Chart Data
    const trendData = [
        { value: 10, label: 'Mon' },
        { value: 25, label: 'Tue' },
        { value: 18, label: 'Wed' },
        { value: 40, label: 'Thu' },
        { value: 32, label: 'Fri' },
        { value: 55, label: 'Sat' },
        { value: Math.max(stats.totalEntities || 45, 10), label: 'Sun' },
    ];

    // Priority Tasks
    const priorityTasks = [
        { id: 1, title: 'Review Entity Registration', subtitle: 'Juspaid International Pvt Ltd', time: '2h ago', icon: 'business', color: '#DC2626' },
        { id: 2, title: 'Approve Staff Credentials', subtitle: '5 pending verifications', time: '4h ago', icon: 'people', color: '#DC2626' },
        { id: 3, title: 'Certificate Renewals', subtitle: '3 certificates expiring this week', time: '1d ago', icon: 'document-text', color: '#DC2626' },
    ];

    // Recent Activity Feed
    const recentActivity = [
        { id: 1, text: 'System security audit completed', user: 'System', date: 'Today, 09:00 AM' },
        { id: 2, text: 'New staff profile uploaded', user: 'John Doe', date: 'Yesterday, 14:30 PM' },
        { id: 3, text: 'Entity credentials verified', user: 'Admin User', date: 'Yesterday, 11:15 AM' },
        { id: 4, text: 'Password reset requested', user: 'Jane Smith', date: 'Oct 24, 08:45 AM' },
    ];

    // Top 5 Audit Logs for Notification Bell
    const auditLogs = [
        { id: 101, title: 'Security Protocol Updated', type: 'System', time: '10 mins ago', icon: 'shield-checkmark' },
        { id: 102, title: 'Failed Login Attempt', type: 'Warning', time: '1 hour ago', icon: 'warning' },
        { id: 103, title: 'Database Backup Completed', type: 'System', time: '3 hours ago', icon: 'server' },
        { id: 104, title: 'New CSO Admin Added', type: 'Access', time: 'Yesterday', icon: 'person-add' },
        { id: 105, title: 'Monthly Report Generated', type: 'Document', time: 'Yesterday', icon: 'document' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            
            {/* Soft Ambient Background Blobs to give the glass something to refract */}
            <View style={styles.bgBlobTopRight} />
            <View style={styles.bgBlobBottomLeft} />

            {/* ── Notifications Modal ── */}
            <Modal
                visible={showNotifications}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowNotifications(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowNotifications(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Recent Audit Logs</Text>
                            <TouchableOpacity onPress={() => setShowNotifications(false)}>
                                <Ionicons name="close-circle" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                            {auditLogs.map((log, index) => (
                                <View key={log.id} style={[styles.logItem, index !== auditLogs.length - 1 && styles.borderBottom]}>
                                    <View style={styles.logIconBg}>
                                        <Ionicons name={log.icon} size={18} color="#DC2626" />
                                    </View>
                                    <View style={styles.logContent}>
                                        <Text style={styles.logTitle}>{log.title}</Text>
                                        <Text style={styles.logMeta}>{log.type} • {log.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        tintColor="#DC2626" 
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <Animated.View style={[
                    styles.header, 
                    { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }
                ]}>
                    <View style={styles.userInfo}>
                        <Text style={styles.greeting}>OVERVIEW DASHBOARD</Text>
                        <Text style={styles.userName}>{user?.fullName || 'CSO Administrator'}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => setShowNotifications(true)} activeOpacity={0.7} style={styles.iconBtn}>
                            <Ionicons name="notifications-outline" size={22} color="#DC2626" />
                            {/* Notification Dot */}
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={logout} activeOpacity={0.7} style={styles.iconBtn}>
                            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* ── Quick Actions (Top Row) ── */}
                <Animated.View style={[styles.actionsRow, { opacity: headerAnim }]}>
                    {[
                        { tab: 'EntitiesTab', icon: 'business', label: 'Entities' },
                        { tab: 'StaffTab', icon: 'people', label: 'Staff' },
                        { tab: 'ApprovalsTab', icon: 'shield-checkmark', label: 'Approvals' },
                    ].map((action, i) => (
                        <TouchableOpacity 
                            key={action.tab} 
                            style={styles.actionChip} 
                            activeOpacity={0.7} 
                            onPress={() => navigation.navigate(action.tab)}
                        >
                            <Ionicons name={action.icon} size={16} color="#DC2626" style={{ marginRight: 6 }} />
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* ── Red Glassmorphic Bento Grid ── */}
                <Animated.View style={[
                    styles.bentoGrid, 
                    { opacity: statsAnim, transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }
                ]}>
                    {/* Entities Card */}
                    <View style={styles.redGlassWrapper}>
                        <Ionicons name="business" size={26} color="#DC2626" style={styles.cardIcon} />
                        <Text style={styles.statValue}>{loading ? '--' : (stats.totalEntities ?? 0)}</Text>
                        <Text style={styles.statLabel}>Entities Managed</Text>
                    </View>

                    {/* Staff Card */}
                    <View style={styles.redGlassWrapper}>
                        <Ionicons name="people" size={26} color="#DC2626" style={styles.cardIcon} />
                        <Text style={styles.statValue}>{loading ? '--' : (stats.totalStaff ?? 0)}</Text>
                        <Text style={styles.statLabel}>Active Staff</Text>
                    </View>

                    {/* Expiring Card */}
                    <View style={styles.redGlassWrapper}>
                        <View style={styles.badgeWrapper}>
                            <Text style={styles.badgeText}>30 DAYS</Text>
                        </View>
                        <Ionicons name="alert-circle" size={26} color="#EF4444" style={styles.cardIcon} />
                        <Text style={styles.statValue}>{loading ? '--' : (stats.expiringCertificates ?? 0)}</Text>
                        <Text style={styles.statLabel}>Expiring Soon</Text>
                    </View>

                    {/* Pending Approvals Card */}
                    <View style={styles.redGlassWrapper}>
                        <Ionicons name="time" size={26} color="#DC2626" style={styles.cardIcon} />
                        <Text style={styles.statValue}>{loading ? '--' : (stats.pendingApprovals ?? 0)}</Text>
                        <Text style={styles.statLabel}>Awaiting Action</Text>
                    </View>
                </Animated.View>

                {/* ── System Trend Area Chart ── */}
                <Animated.View style={[
                    styles.sectionContainer, 
                    { opacity: chartAnim, transform: [{ translateY: chartAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
                ]}>
                    <Text style={styles.sectionTitle}>System Activity Trend</Text>
                    <View style={styles.redGlassPanel}>
                        {loading && !data ? (
                            <View style={styles.chartLoader}>
                                <ActivityIndicator color="#DC2626" />
                                <Text style={styles.loadingText}>Loading Analytics...</Text>
                            </View>
                        ) : (
                            <LineChart
                                data={trendData}
                                thickness={3}
                                color="#DC2626"
                                maxValue={80}
                                noOfSections={4}
                                areaChart
                                yAxisTextStyle={{ color: '#94A3B8', fontSize: 11, fontWeight: '600' }}
                                xAxisLabelTextStyle={{ color: '#64748B', fontSize: 11, fontWeight: '600' }}
                                startFillColor="rgba(220, 38, 38, 0.25)"
                                endFillColor="rgba(220, 38, 38, 0.01)"
                                startOpacity={0.9}
                                endOpacity={0.2}
                                spacing={45}
                                backgroundColor="transparent"
                                rulesColor="rgba(220, 38, 38, 0.05)"
                                rulesType="solid"
                                yAxisColor="transparent"
                                xAxisColor="rgba(220, 38, 38, 0.1)"
                                initialSpacing={15}
                                dataPointsColor="#991B1B"
                                dataPointsRadius={4}
                                isAnimated
                            />
                        )}
                    </View>
                </Animated.View>

                {/* ── Priority Tasks ── */}
                <Animated.View style={[
                    styles.sectionContainer,
                    { opacity: tasksAnim, transform: [{ translateY: tasksAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
                ]}>
                    <Text style={styles.sectionTitle}>Priority Tasks</Text>
                    <View style={styles.redGlassPanel}>
                        {priorityTasks.map((task, index) => (
                            <TouchableOpacity key={task.id} style={[styles.taskItem, index !== priorityTasks.length - 1 && styles.borderBottom]} activeOpacity={0.6}>
                                <View style={styles.taskIconBg}>
                                    <Ionicons name={task.icon} size={20} color={task.color} />
                                </View>
                                <View style={styles.taskContent}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
                                </View>
                                <Text style={styles.taskTime}>{task.time}</Text>
                                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* ── Recent Activity Feed ── */}
                <Animated.View style={[
                    styles.sectionContainer,
                    { opacity: activityAnim, transform: [{ translateY: activityAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
                ]}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.redGlassPanel}>
                        {recentActivity.map((activity, index) => (
                            <View key={activity.id} style={styles.activityItem}>
                                <View style={styles.activityDotWrapper}>
                                    <View style={styles.activityDot} />
                                    {index !== recentActivity.length - 1 && <View style={styles.activityLine} />}
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityText}>{activity.text}</Text>
                                    <Text style={styles.activityMeta}>{activity.user} • {activity.date}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', 
    },
    
    // Ambient Blobs
    bgBlobTopRight: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 300,
        height: 300,
        backgroundColor: 'rgba(220, 38, 38, 0.04)',
        borderRadius: 150,
    },
    bgBlobBottomLeft: {
        position: 'absolute',
        top: 300,
        left: -100,
        width: 400,
        height: 400,
        backgroundColor: 'rgba(220, 38, 38, 0.03)',
        borderRadius: 200,
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
        paddingBottom: 20,
    },

    // ── Header & Buttons ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    userInfo: {
        flex: 1,
    },
    greeting: {
        fontSize: 12,
        color: '#DC2626', 
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    userName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: 'rgba(220, 38, 38, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(220, 38, 38, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },

    // ── Notifications Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)', // Dark slate translucent
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxHeight: '70%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    modalScroll: {
        flexGrow: 0,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    logIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logContent: {
        flex: 1,
    },
    logTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    logMeta: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },

    // ── Quick Actions (Top Row) ──
    actionsRow: {
        flexDirection: 'row',
        marginBottom: 32,
        gap: 12,
    },
    actionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(220, 38, 38, 0.06)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(220, 38, 38, 0.15)',
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#DC2626',
    },

    // ── Bento Grid Stats ──
    bentoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 16,
        marginBottom: 36,
    },// ── Bento Grid Stats ──
    redGlassWrapper: {
        width: cardWidth,
        height: 120, 
        backgroundColor: 'rgba(220, 38, 38, 0.06)', // Slightly stronger tint since we removed the shadow
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5, // Slightly thicker border for that glass edge light
        borderColor: 'rgba(220, 38, 38, 0.2)', 
        padding: 16,
        // 👇 ALL SHADOWS AND ELEVATION REMOVED 👇
    },

    // ── Sections & Full Width Panels ──
    redGlassPanel: {
        width: '100%',
        backgroundColor: 'rgba(220, 38, 38, 0.05)',
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: 'rgba(220, 38, 38, 0.2)',
        padding: 20,
        // 👇 ALL SHADOWS AND ELEVATION REMOVED 👇
    },
    cardIcon: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: 2,
        letterSpacing: -1,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '700',
    },
    badgeWrapper: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#DC2626',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // ── Sections & Full Width Panels ──
    sectionContainer: {
        marginBottom: 36,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 16,
        letterSpacing: 0.2,
    },
    
    // Chart
    chartLoader: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#DC2626',
        fontWeight: '600',
        fontSize: 14,
    },

    // Tasks List
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(220, 38, 38, 0.1)',
    },
    taskIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 2,
    },
    taskSubtitle: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    taskTime: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
        marginRight: 8,
    },

    // Activity Feed
    activityItem: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    activityDotWrapper: {
        alignItems: 'center',
        marginRight: 16,
        width: 16,
    },
    activityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#DC2626',
        marginTop: 4,
    },
    activityLine: {
        width: 2,
        flex: 1,
        backgroundColor: 'rgba(220, 38, 38, 0.15)',
        marginTop: 4,
        marginBottom: -4,
    },
    activityContent: {
        flex: 1,
        paddingBottom: 24,
    },
    activityText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    activityMeta: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
});