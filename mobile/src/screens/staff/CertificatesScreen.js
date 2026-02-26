// KIAL AVSEC Mobile - Staff Certificates Screen
import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import staffApi from '../../api/staffApi';
import CertificateCard from '../../components/CertificateCard';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing } from '../../theme';

const CertificatesScreen = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCertificates = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await staffApi.getCertificates();
            setCertificates(res.data.data || []);
        } catch (err) {
            console.error('Fetch certificates error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchCertificates(); }, []));

    if (loading && !certificates.length) return <LoadingOverlay />;

    return (
        <View style={styles.container}>
            <FlatList
                data={certificates}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <CertificateCard certificate={item} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCertificates(true); }} />}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState icon="document-text-outline" title="No certificates" message="You don't have any certificates yet" />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    list: { padding: spacing.lg },
});

export default CertificatesScreen;
