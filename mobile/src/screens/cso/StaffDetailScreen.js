// KIAL AVSEC Mobile — V3 Staff Detail Screen (CSO view)
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import adminApi from '../../api/adminApi';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import CertificateCard from '../../components/CertificateCard';
import { colors, spacing, typography } from '../../theme';
import theme from '../../theme';

const StaffDetailScreen = ({ route }) => {
    const { staffId } = route.params;
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStaff = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await adminApi.getStaffById(staffId);
            setStaff(res.data.data);
        } catch (err) {
            console.error('Fetch staff error:', err);
            Alert.alert('Error', 'Failed to load staff details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchStaff(); }, [staffId]));

    if (loading && !staff) return <LoadingOverlay />;
    if (!staff) return null;

    const InfoRow = ({ label, value }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || '—'}</Text>
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStaff(true); }} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={[styles.avatar, staff.isKialStaff && styles.avatarKial]}>
                    <Text style={[styles.avatarText, staff.isKialStaff && styles.avatarTextKial]}>
                        {staff.fullName?.charAt(0)?.toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.name}>{staff.fullName}</Text>
                <Text style={styles.designation}>{staff.designation || 'Staff Member'}</Text>
                <View style={styles.badges}>
                    {staff.isKialStaff && <Badge label="KIAL Staff" variant="info" size="md" />}
                    {staff.entity && <Badge label={staff.entity.name} variant="neutral" size="md" />}
                </View>
            </View>

            {/* Details */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Information</Text>
            </View>
            <Card>
                <InfoRow label="Employee Code" value={staff.empCode} />
                <InfoRow label="Department" value={staff.department} />
                <InfoRow label="AEP Number" value={staff.aepNumber} />
                <InfoRow label="Aadhaar" value={staff.aadhaarNumber} />
                <InfoRow label="Phone" value={staff.phoneNumber} />
                <InfoRow label="Terminals" value={staff.terminals} />
                {staff.zones?.length > 0 && <InfoRow label="Zones" value={staff.zones.join(', ')} />}
            </Card>

            {/* Certificates */}
            {staff.certificates?.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionAccent} />
                        <Text style={styles.sectionTitle}>Certificates ({staff.certificates.length})</Text>
                    </View>
                    {staff.certificates.map((cert) => (
                        <CertificateCard key={cert.id} certificate={cert} />
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
    profileHeader: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        marginBottom: spacing.md,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: theme.radius.xl,
        backgroundColor: colors.surfaceDim,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarKial: { backgroundColor: colors.primaryGlow },
    avatarText: {
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.textSecondary,
        fontFamily: typography.family,
    },
    avatarTextKial: { color: colors.primary },
    name: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        fontFamily: typography.family,
    },
    designation: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        fontFamily: typography.family,
        marginTop: 4,
    },
    badges: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
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
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    infoLabel: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        fontFamily: typography.family,
        flex: 1,
    },
    infoValue: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.medium,
        color: colors.textPrimary,
        fontFamily: typography.family,
        flex: 1,
        textAlign: 'right',
    },
});

export default StaffDetailScreen;
