// KIAL AVSEC Mobile — V3 CSO Tab Navigator
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';
import theme from '../theme';

// Screens
import DashboardScreen from '../screens/cso/DashboardScreen';
import EntitiesScreen from '../screens/cso/EntitiesScreen';
import EntityDetailScreen from '../screens/cso/EntityDetailScreen';
import StaffListScreen from '../screens/cso/StaffListScreen';
import StaffDetailScreen from '../screens/cso/StaffDetailScreen';
import ApprovalsScreen from '../screens/cso/ApprovalsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
        fontFamily: typography.family,
        fontWeight: typography.weight.semibold,
        fontSize: typography.size.md,
    },
    headerShadowVisible: false,
};

const EntitiesStack = () => (
    <Stack.Navigator screenOptions={stackScreenOptions}>
        <Stack.Screen name="EntitiesList" component={EntitiesScreen} options={{ title: 'Entities' }} />
        <Stack.Screen name="EntityDetail" component={EntityDetailScreen} options={{ title: 'Entity Details' }} />
        <Stack.Screen name="StaffDetail" component={StaffDetailScreen} options={{ title: 'Staff Details' }} />
    </Stack.Navigator>
);

const StaffStack = () => (
    <Stack.Navigator screenOptions={stackScreenOptions}>
        <Stack.Screen name="StaffList" component={StaffListScreen} options={{ title: 'Staff' }} />
        <Stack.Screen name="StaffDetail" component={StaffDetailScreen} options={{ title: 'Staff Details' }} />
    </Stack.Navigator>
);

const CSOTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'DashboardTab') iconName = focused ? 'grid' : 'grid-outline';
                else if (route.name === 'EntitiesTab') iconName = focused ? 'business' : 'business-outline';
                else if (route.name === 'StaffTab') iconName = focused ? 'people' : 'people-outline';
                else if (route.name === 'ApprovalsTab') iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
                return <Ionicons name={iconName} size={21} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textTertiary,
            tabBarStyle: {
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderTopColor: colors.glassBorderSubtle,
                borderTopWidth: 1,
                paddingBottom: 8,
                paddingTop: 8,
                height: 64,
            },
            tabBarLabelStyle: {
                fontFamily: typography.family,
                fontSize: 10,
                fontWeight: typography.weight.semibold,
                letterSpacing: 0.2,
            },
            headerShown: false,
        })}
    >
        <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        <Tab.Screen name="EntitiesTab" component={EntitiesStack} options={{ title: 'Entities' }} />
        <Tab.Screen name="StaffTab" component={StaffStack} options={{ title: 'Staff' }} />
        <Tab.Screen name="ApprovalsTab" component={ApprovalsScreen} options={{ title: 'Approvals', headerShown: true, headerTitle: 'Approvals', headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false, headerTitleStyle: { fontFamily: typography.family, fontWeight: typography.weight.semibold, fontSize: typography.size.md, color: colors.textPrimary } }} />
    </Tab.Navigator>
);

export default CSOTabs;
