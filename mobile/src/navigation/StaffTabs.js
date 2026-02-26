// KIAL AVSEC Mobile - Staff Tab Navigator
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

// Screens
import ProfileScreen from '../screens/staff/ProfileScreen';
import CertificatesScreen from '../screens/staff/CertificatesScreen';

const Tab = createBottomTabNavigator();

const StaffTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color }) => {
                let iconName;
                if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
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
            headerShown: true,
            headerStyle: { backgroundColor: colors.white },
            headerShadowVisible: false,
            headerTitleStyle: { fontFamily: typography.family, fontWeight: typography.weight.semibold, color: colors.textPrimary },
        })}
    >
        <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <Tab.Screen name="CertificatesTab" component={CertificatesScreen} options={{ title: 'Certificates' }} />
    </Tab.Navigator>
);

export default StaffTabs;
