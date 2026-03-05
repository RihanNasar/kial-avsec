// KIAL AVSEC Mobile — V3 Entity Certificates Screen
import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import entityApi from '../../api/entityApi';
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
            const res = await entityApi.getCertificates();
            setCertificates(res.data.data || []);
        } catch (err) {
            console.error('Fetch entity certificates error:', err);
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
                renderItem={({ item }) => <CertificateCard certificate={item} showStaff />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCertificates(true); }} />}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState icon="document-text-outline" title="No certificates" message="No certificates have been added for your staff" />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.screenPadding },
});

export default CertificatesScreen;
