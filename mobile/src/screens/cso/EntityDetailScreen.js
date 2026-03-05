// KIAL AVSEC Mobile — V3 CSO Entity Detail
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import adminApi from '../../api/adminApi';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import GlassCard from '../../components/ui/GlassCard';
import CertificateCard from '../../components/CertificateCard';
import StaffCard from '../../components/StaffCard';
import { colors, spacing, typography } from '../../theme';
import theme from '../../theme';
import { formatDate, isExpired, isExpiringSoon } from '../../utils/dateHelpers';

const EntityDetailScreen = ({ route, navigation }) => {
    const { entityId } = route.params;
    const [entity, setEntity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEntity = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await adminApi.getEntity(entityId);
            setEntity(res.data.data);
        } catch (err) {
            console.error('Fetch entity error:', err);
            Alert.alert('Error', 'Failed to load entity details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchEntity(); }, [entityId]));

    if (loading && !entity) return <LoadingOverlay />;
    if (!entity) return null;

    const getContractBadge = () => {
        if (!entity.contractValidTo) return { label: 'No Contract', variant: 'neutral' };
        if (isExpired(entity.contractValidTo)) return { label: 'Expired', variant: 'danger' };
        if (isExpiringSoon(entity.contractValidTo, 30)) return { label: 'Expiring', variant: 'warning' };
        return { label: 'Active', variant: 'success' };
    };

    const contractBadge = getContractBadge();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEntity(true); }} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Entity Header */}
            <GlassCard borderRadius={theme.radius.xl} variant="elevated">
                <View style={styles.headerTop}>
                    <View style={styles.entityIcon}>
                        <Ionicons name="business" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.entityName}>{entity.name}</Text>
                        {entity.externalEntityCode && (
                            <Text style={styles.entityCode}>{entity.externalEntityCode}</Text>
                        )}
                    </View>
                    <Badge label={contractBadge.label} variant={contractBadge.variant} size="md" />
                </View>

                {entity.category && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Category</Text>
                        <Text style={styles.detailValue}>{entity.category}</Text>
                    </View>
                )}
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Contract</Text>
                    <Text style={styles.detailValue}>
                        {formatDate(entity.contractValidFrom)} — {formatDate(entity.contractValidTo)}
                    </Text>
                </View>
            </GlassCard>

            {/* ASCO Info */}
            {(entity.ascoName || entity.ascoEmail) && (
                <>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionAccent} />
                        <Text style={styles.sectionTitle}>ASCO Contact</Text>
                    </View>
                    <Card>
                        <View style={styles.ascoRow}>
                            <View style={styles.ascoAvatar}>
                                <Text style={styles.ascoInitial}>{entity.ascoName?.charAt(0) || 'A'}</Text>
                            </View>
                            <View style={styles.ascoInfo}>
                                <Text style={styles.ascoName}>{entity.ascoName || '—'}</Text>
                                {entity.ascoEmail && <Text style={styles.ascoDetail}>{entity.ascoEmail}</Text>}
                                {entity.ascoContactNo && <Text style={styles.ascoDetail}>{entity.ascoContactNo}</Text>}
                            </View>
                        </View>
                    </Card>
                </>
            )}

            {/* Certificates */}
            {entity.certificates?.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionAccent} />
                        <Text style={styles.sectionTitle}>Entity Certificates ({entity.certificates.length})</Text>
                    </View>
                    {entity.certificates.map((cert) => (
                        <CertificateCard key={cert.id} certificate={cert} />
                    ))}
                </>
            )}

            {/* Staff */}
            {entity.staffMembers?.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionAccent} />
                        <Text style={styles.sectionTitle}>Staff Members ({entity.staffMembers.length})</Text>
                    </View>
                    {entity.staffMembers.map((staff) => (
                        <StaffCard key={staff.id} staff={staff} onPress={() => navigation.navigate('StaffDetail', { staffId: staff.id })} />
                    ))}
                </>
            )}

            <View style={{ height: spacing.xxl }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.screenPadding },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    entityIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.md,
        backgroundColor: colors.primaryGlow,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    headerInfo: { flex: 1, marginRight: spacing.sm },
    entityName: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        fontFamily: typography.family,
    },
    entityCode: {
        fontSize: typography.size.xs,
        color: colors.textTertiary,
        fontFamily: typography.family,
        marginTop: 2,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    detailLabel: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        fontFamily: typography.family,
    },
    detailValue: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.medium,
        color: colors.textPrimary,
        fontFamily: typography.family,
    },
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
    },
    ascoRow: { flexDirection: 'row', alignItems: 'center' },
    ascoAvatar: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.sm,
        backgroundColor: colors.accentSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    ascoInitial: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.accent,
        fontFamily: typography.family,
    },
    ascoInfo: { flex: 1 },
    ascoName: {
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        color: colors.textPrimary,
        fontFamily: typography.family,
    },
    ascoDetail: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
        fontFamily: typography.family,
        marginTop: 2,
    },
});

export default EntityDetailScreen;
