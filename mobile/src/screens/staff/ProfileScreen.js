// KIAL AVSEC Mobile — V3 Staff Profile Screen
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import staffApi from '../../api/staffApi';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import CertificateCard from '../../components/CertificateCard';
import { colors, spacing, typography } from '../../theme';
import theme from '../../theme';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await staffApi.getProfile();
            setProfile(res.data.data);
        } catch (err) {
            console.error('Fetch profile error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchProfile(); }, []));

    if (loading && !profile) return <LoadingOverlay />;

    const p = profile || {};

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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(true); }} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.headerTop}>
                    <View style={[styles.avatar, p.isKialStaff && styles.avatarKial]}>
                        <Text style={[styles.avatarText, p.isKialStaff && styles.avatarTextKial]}>
                            {p.fullName?.charAt(0)?.toUpperCase() || 'S'}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
                        <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.name}>{p.fullName}</Text>
                <Text style={styles.designation}>{p.designation || 'Staff Member'}</Text>
                <View style={styles.badges}>
                    {p.isKialStaff && <Badge label="KIAL Staff" variant="info" size="md" />}
                    {p.department && <Badge label={p.department} variant="neutral" size="md" />}
                </View>
            </View>

            {/* Details */}
            <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <Card>
                <InfoRow label="Employee Code" value={p.empCode} />
                <InfoRow label="Entity" value={p.entity?.name} />
                <InfoRow label="Department" value={p.department} />
                <InfoRow label="AEP Number" value={p.aepNumber} />
                <InfoRow label="Phone" value={p.phoneNumber} />
                <InfoRow label="Terminals" value={p.terminals} />
                {p.zones?.length > 0 && <InfoRow label="Zones" value={p.zones.join(', ')} />}
            </Card>

            {/* Certificates Summary */}
            {p.certificates?.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionAccent} />
                        <Text style={styles.sectionTitle}>My Certificates ({p.certificates.length})</Text>
                    </View>
                    {p.certificates.slice(0, 3).map((cert) => (
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
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        marginBottom: spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: theme.radius.lg,
        backgroundColor: colors.surfaceDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarKial: { backgroundColor: colors.primaryGlow },
    avatarText: {
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.textSecondary,
        fontFamily: typography.family,
    },
    avatarTextKial: { color: colors.primary },
    logoutBtn: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.sm,
        backgroundColor: colors.glassBg,
        borderWidth: 1,
        borderColor: colors.glassBorderSubtle,
        justifyContent: 'center',
        alignItems: 'center',
    },
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

export default ProfileScreen;
