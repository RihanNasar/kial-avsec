// KIAL AVSEC Mobile - CSO Entity Detail Screen
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import adminApi from '../../api/adminApi';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import CertificateCard from '../../components/CertificateCard';
import StaffCard from '../../components/StaffCard';
import { colors, spacing, typography } from '../../theme';
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

    useFocusEffect(
        useCallback(() => {
            fetchEntity();
        }, [entityId])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchEntity(true);
    };

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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Entity Header */}
            <View style={styles.headerCard}>
                <View style={styles.headerTop}>
                    <View style={styles.entityIcon}>
                        <Ionicons name="business" size={28} color={colors.red} />
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
            </View>

            {/* ASCO Info */}
            {(entity.ascoName || entity.ascoEmail) && (
                <>
                    <Text style={styles.sectionTitle}>ASCO Contact</Text>
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

            {/* Entity Certificates */}
            {entity.certificates?.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Entity Certificates ({entity.certificates.length})</Text>
                    {entity.certificates.map((cert) => (
                        <CertificateCard key={cert.id} certificate={cert} />
                    ))}
                </>
            )}

            {/* Staff Members */}
            {entity.staffMembers?.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Staff Members ({entity.staffMembers.length})</Text>
                    {entity.staffMembers.map((staff) => (
                        <StaffCard
                            key={staff.id}
                            staff={staff}
                            onPress={() => navigation.navigate('StaffDetail', { staffId: staff.id })}
                        />
                    ))}
                </>
            )}

            <View style={{ height: spacing.xxl }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    content: { padding: spacing.lg },
    headerCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.base,
    },
    entityIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: colors.redLight,
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
    sectionTitle: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        fontFamily: typography.family,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    ascoRow: { flexDirection: 'row', alignItems: 'center' },
    ascoAvatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.accentLight,
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
