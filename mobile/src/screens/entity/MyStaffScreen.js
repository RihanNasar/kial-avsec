// KIAL AVSEC Mobile - Entity Head Staff Screen
import React, { useState, useCallback } from 'react';
import { View, FlatList, TextInput, StyleSheet, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import entityApi from '../../api/entityApi';
import StaffCard from '../../components/StaffCard';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, typography } from '../../theme';

const MyStaffScreen = ({ navigation }) => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchStaff = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await entityApi.getStaff();
            setStaff(res.data.data || []);
        } catch (err) {
            console.error('Fetch entity staff error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchStaff(); }, []));

    const filtered = staff.filter((s) =>
        s.fullName?.toLowerCase().includes(search.toLowerCase())
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
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <StaffCard
                        staff={item}
                        onPress={() => navigation.navigate('StaffDetail', { staffId: item.id })}
                    />
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStaff(true); }} />}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState icon="people-outline" title="No staff members" message="Your entity has no staff members yet" />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
        marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm,
        borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? spacing.md : 0,
        borderWidth: 1, borderColor: colors.border,
    },
    searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: typography.size.base, color: colors.textPrimary, fontFamily: typography.family, paddingVertical: spacing.md },
    list: { padding: spacing.lg },
});

export default MyStaffScreen;
