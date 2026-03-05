// KIAL AVSEC Mobile — V3 Glassmorphic Card
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import theme from '../../theme';

const Card = ({ children, onPress, style, padded = true }) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            style={[
                styles.card,
                theme.shadow.sm,
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
        backgroundColor: colors.glassBgStrong,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorderSubtle,
    },
    padded: {
        padding: spacing.cardPadding,
    },
});

export default Card;
