// KIAL AVSEC Mobile - CSO Entities List Screen
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    StyleSheet,
    RefreshControl,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import adminApi from '../../api/adminApi';
import EntityCard from '../../components/EntityCard';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, typography } from '../../theme';

const EntitiesScreen = ({ navigation }) => {
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchEntities = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const res = await adminApi.getEntities({ search: '' });
            setEntities(res.data.data || []);
        } catch (err) {
            console.error('Fetch entities error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEntities();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchEntities(true);
    };

    const filtered = entities.filter((e) =>
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.externalEntityCode?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && !entities.length) return <LoadingOverlay />;

    return (
        <View style={styles.container}>
            <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search entities..."
                    placeholderTextColor={colors.textTertiary}
                    style={styles.searchInput}
                />
                {search ? (
                    <Ionicons name="close-circle" size={18} color={colors.textTertiary} onPress={() => setSearch('')} />
                ) : null}
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <EntityCard
                        entity={item}
                        onPress={() => navigation.navigate('EntityDetail', { entityId: item.id })}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon="business-outline"
                        title="No entities found"
                        message={search ? 'Try a different search term' : 'No entities have been added yet'}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        paddingVertical: Platform.OS === 'ios' ? spacing.md : 0,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: typography.size.base,
        color: colors.textPrimary,
        fontFamily: typography.family,
        paddingVertical: spacing.md,
    },
    list: {
        padding: spacing.lg,
    },
});

export default EntitiesScreen;
