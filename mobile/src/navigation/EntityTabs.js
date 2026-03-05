// KIAL AVSEC Mobile — V3 Entity Head Tab Navigator
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

// Screens
import DashboardScreen from '../screens/entity/DashboardScreen';
import MyStaffScreen from '../screens/entity/MyStaffScreen';
import CertificatesScreen from '../screens/entity/CertificatesScreen';
import StaffDetailScreen from '../screens/cso/StaffDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const StaffStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: { fontFamily: typography.family, fontWeight: typography.weight.semibold, fontSize: typography.size.md },
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
        <Tab.Screen name="StaffTab" component={StaffStack} options={{ title: 'My Staff' }} />
        <Tab.Screen name="CertificatesTab" component={CertificatesScreen} options={{ title: 'Certificates', headerShown: true, headerTitle: 'Certificates', headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false, headerTitleStyle: { fontFamily: typography.family, fontWeight: typography.weight.semibold, color: colors.textPrimary, fontSize: typography.size.md } }} />
    </Tab.Navigator>
);

export default EntityTabs;
