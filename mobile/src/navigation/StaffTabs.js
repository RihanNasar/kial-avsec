// KIAL AVSEC Mobile — V3 Staff Tab Navigator
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
            headerShown: true,
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTitleStyle: {
                fontFamily: typography.family,
                fontWeight: typography.weight.semibold,
                color: colors.textPrimary,
                fontSize: typography.size.md,
            },
        })}
    >
        <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <Tab.Screen name="CertificatesTab" component={CertificatesScreen} options={{ title: 'Certificates' }} />
    </Tab.Navigator>
);

export default StaffTabs;
