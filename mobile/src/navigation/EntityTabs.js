// KIAL AVSEC Mobile - Entity Head Tab Navigator
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

// Screens
import DashboardScreen from '../screens/entity/DashboardScreen';
import MyStaffScreen from '../screens/entity/MyStaffScreen';
import CertificatesScreen from '../screens/entity/CertificatesScreen';

// Shared detail screen
import StaffDetailScreen from '../screens/cso/StaffDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const StaffStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.white },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: { fontFamily: typography.family, fontWeight: typography.weight.semibold },
            headerShadowVisible: false,
        }}
    >
        <Stack.Screen name="MyStaffList" component={MyStaffScreen} options={{ title: 'My Staff' }} />
        <Stack.Screen name="StaffDetail" component={StaffDetailScreen} options={{ title: 'Staff Details' }} />
    </Stack.Navigator>
);

const EntityTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color }) => {
                let iconName;
                if (route.name === 'DashboardTab') iconName = focused ? 'grid' : 'grid-outline';
                else if (route.name === 'StaffTab') iconName = focused ? 'people' : 'people-outline';
                else if (route.name === 'CertificatesTab') iconName = focused ? 'document-text' : 'document-text-outline';
                return <Ionicons name={iconName} size={22} color={color} />;
            },
            tabBarActiveTintColor: colors.red,
            tabBarInactiveTintColor: colors.textTertiary,
            tabBarStyle: {
                backgroundColor: colors.white,
                borderTopColor: colors.border,
                paddingBottom: 6,
                paddingTop: 6,
                height: 60,
            },
            tabBarLabelStyle: {
                fontFamily: typography.family,
                fontSize: 10,
                fontWeight: typography.weight.medium,
            },
            headerShown: false,
        })}
    >
        <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        <Tab.Screen name="StaffTab" component={StaffStack} options={{ title: 'My Staff' }} />
        <Tab.Screen name="CertificatesTab" component={CertificatesScreen} options={{ title: 'Certificates', headerShown: true, headerTitle: 'Certificates', headerStyle: { backgroundColor: colors.white }, headerShadowVisible: false }} />
    </Tab.Navigator>
);

export default EntityTabs;
