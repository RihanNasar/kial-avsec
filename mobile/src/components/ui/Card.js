// KIAL AVSEC Mobile - Card Component
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

const Card = ({ children, onPress, style, padded = true }) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            style={[
                styles.card,
                padded && styles.padded,
                style,
            ]}
        >
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    padded: {
        padding: spacing.base,
    },
});

export default Card;
