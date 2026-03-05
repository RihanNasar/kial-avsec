// KIAL AVSEC Mobile — V3 CSO Staff List
import React, { useState, useCallback } from 'react';
import { View, FlatList, TextInput, StyleSheet, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import adminApi from '../../api/adminApi';
import StaffCard from '../../components/StaffCard';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, typography } from '../../theme';
import theme from '../../theme';

const StaffListScreen = ({ navigation }) => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchStaff = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await adminApi.getStaff({ search: '' });
            setStaff(res.data.data || []);
        } catch (err) {
            console.error('Fetch staff error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchStaff(); }, []));

    const filtered = staff.filter((s) =>
        s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        s.empCode?.toLowerCase().includes(search.toLowerCase()) ||
        s.entity?.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && !staff.length) return <LoadingOverlay />;

    return (
        <View style={styles.container}>
            <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search staff..."
                    placeholderTextColor={colors.textTertiary}
                    style={styles.searchInput}
                />
                {search ? <Ionicons name="close-circle" size={18} color={colors.textTertiary} onPress={() => setSearch('')} /> : null}
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <StaffCard staff={item} showEntity onPress={() => navigation.navigate('StaffDetail', { staffId: item.id })} />
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStaff(true); }} tintColor={colors.primary} />}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState icon="people-outline" title="No staff found" message={search ? 'Try a different search term' : 'No staff members have been added yet'} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glassBg,
        marginHorizontal: spacing.screenPadding,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: theme.radius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: Platform.OS === 'ios' ? spacing.sm : 0,
        borderWidth: 1,
        borderColor: colors.glassBorderSubtle,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: typography.size.base,
        color: colors.textPrimary,
        fontFamily: typography.family,
        paddingVertical: spacing.sm + 2,
    },
    list: { padding: spacing.screenPadding },
});

export default StaffListScreen;
