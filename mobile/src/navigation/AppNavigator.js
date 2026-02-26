// KIAL AVSEC Mobile - Root App Navigator
// Routes users to auth or role-specific screens based on auth state

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import CSOTabs from './CSOTabs';
import EntityTabs from './EntityTabs';
import StaffTabs from './StaffTabs';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { ROLES } from '../constants/roles';

const AppNavigator = () => {
    const { user, loading, isAuthenticated } = useAuth();

    // Show splash/loading while restoring session
    if (loading) {
        return <LoadingOverlay message="Loading..." />;
    }

    // Not authenticated → show login
    if (!isAuthenticated) {
        return (
            <NavigationContainer>
                <AuthStack />
            </NavigationContainer>
        );
    }

    // Authenticated → route by role
    const getMainScreen = () => {
        switch (user?.role) {
            case ROLES.CSO:
                return <CSOTabs />;
            case ROLES.ENTITY_HEAD:
                return <EntityTabs />;
            case ROLES.STAFF:
                return <StaffTabs />;
            default:
                return <AuthStack />;
        }
    };

    return (
        <NavigationContainer>
            {getMainScreen()}
        </NavigationContainer>
    );
};

export default AppNavigator;
