// KIAL AVSEC Mobile — V3 CSO Approvals Screen
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import adminApi from '../../api/adminApi';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { colors, spacing, typography } from '../../theme';
import theme from '../../theme';
import { formatDate } from '../../utils/dateHelpers';

const ApprovalsScreen = () => {
    const [tab, setTab] = useState('pending');
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const [pendingRes, historyRes] = await Promise.all([
                adminApi.getPendingApprovals(),
                adminApi.getApprovalHistory(),
            ]);
            setPending(pendingRes.data.data || []);
            setHistory(historyRes.data.data || []);
        } catch (err) {
            console.error('Fetch approvals error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, []));

    const handleReview = async (id, status) => {
        const action = status === 'APPROVED' ? 'approve' : 'reject';
        Alert.alert(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Request`,
            `Are you sure you want to ${action} this request?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: action.charAt(0).toUpperCase() + action.slice(1),
                    style: status === 'REJECTED' ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            await adminApi.reviewApproval(id, { status });
                            fetchData(true);
                        } catch (err) {
                            Alert.alert('Error', 'Failed to process request');
                        }
                    },
                },
            ]
        );
    };

    if (loading) return <LoadingOverlay />;

    const data = tab === 'pending' ? pending : history;

    const renderPendingItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Badge
                    label={item.action}
                    variant={item.action === 'CREATE' ? 'info' : item.action === 'DELETE' ? 'danger' : 'warning'}
                    size="sm"
                />
                <Text style={styles.entityType}>{item.entityType}</Text>
            </View>
            <Text style={styles.requester}>
                By {item.requester?.fullName || 'Unknown'} · {formatDate(item.createdAt)}
            </Text>
            {item.currentData?.fullName && (
                <Text style={styles.targetName}>{item.currentData.fullName}</Text>
            )}
            <View style={styles.actions}>
                <Button title="Approve" size="sm" onPress={() => handleReview(item.id, 'APPROVED')} style={{ flex: 1, marginRight: 8 }} />
                <Button title="Reject" variant="danger" size="sm" onPress={() => handleReview(item.id, 'REJECTED')} style={{ flex: 1 }} />
            </View>
        </View>
    );

    const renderHistoryItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Badge label={item.status} variant={item.status === 'APPROVED' ? 'success' : 'danger'} size="sm" />
                <Text style={styles.entityType}>{item.entityType} · {item.action}</Text>
            </View>
            <Text style={styles.requester}>
                By {item.requester?.fullName || 'Unknown'} · {formatDate(item.updatedAt)}
            </Text>
            {item.reviewer && (
                <Text style={styles.reviewer}>Reviewed by {item.reviewer.fullName}</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Tab Switcher */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'pending' && styles.activeTab]}
                    onPress={() => setTab('pending')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, tab === 'pending' && styles.activeTabText]}>
                        Pending ({pending.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'history' && styles.activeTab]}
                    onPress={() => setTab('history')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, tab === 'history' && styles.activeTabText]}>
                        History
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => String(item.id)}
                renderItem={tab === 'pending' ? renderPendingItem : renderHistoryItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(true); }} />}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon="checkmark-circle-outline"
                        title={tab === 'pending' ? 'No pending approvals' : 'No history yet'}
                        message={tab === 'pending' ? 'All requests have been processed' : 'Approved/rejected items will appear here'}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    tabs: {
        flexDirection: 'row',
        marginHorizontal: spacing.screenPadding,
        marginTop: spacing.md,
        backgroundColor: colors.glassBg,
        borderRadius: theme.radius.sm,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.glassBorderSubtle,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm + 2,
        alignItems: 'center',
        borderRadius: theme.radius.xs,
    },
    activeTab: {
        backgroundColor: colors.white,
        ...theme.shadow.sm,
    },
    tabText: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.medium,
        color: colors.textSecondary,
        fontFamily: typography.family,
    },
    activeTabText: {
        color: colors.textPrimary,
        fontWeight: typography.weight.semibold,
    },
    list: { padding: spacing.screenPadding },
    card: {
        backgroundColor: colors.glassBgStrong,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: colors.glassBorderSubtle,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...theme.shadow.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: 6,
    },
    entityType: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.medium,
        color: colors.textPrimary,
        fontFamily: typography.family,
    },
    requester: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
        fontFamily: typography.family,
    },
    targetName: {
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        color: colors.textPrimary,
        fontFamily: typography.family,
        marginTop: 4,
    },
    reviewer: {
        fontSize: typography.size.xs,
        color: colors.textTertiary,
        fontFamily: typography.family,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
});

export default ApprovalsScreen;
