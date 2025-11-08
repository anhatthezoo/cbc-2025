import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from './ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  /** Button text content */
  title: string;

  /** Callback when button is pressed */
  onPress?: () => void;

  /** Visual style variant */
  variant?: ButtonVariant;

  /** Button size */
  size?: ButtonSize;

  /** Disabled state */
  disabled?: boolean;

  /** Show loading spinner */
  loading?: boolean;

  /** Full width button */
  fullWidth?: boolean;

  /** Custom style override */
  style?: ViewStyle;

  /** Custom text style override */
  textStyle?: TextStyle;

  /** Accessibility label */
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const isDisabled = disabled || loading;

  // Size configurations
  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.fontSize.sm,
      minHeight: 36,
    },
    md: {
      paddingVertical: theme.spacing.md - 2,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.fontSize.base,
      minHeight: 48,
    },
    lg: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      fontSize: theme.typography.fontSize.lg,
      minHeight: 56,
    },
  };

  // Variant configurations
  const getVariantStyles = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.background,
      borderWidth: 0,
    };

    const baseTextStyle: TextStyle = {
      color: theme.colors.text,
    };

    switch (variant) {
      case 'primary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: theme.colors.primary,
            ...theme.shadows.sm,
          },
          text: {
            ...baseTextStyle,
            color: '#FFFFFF',
          },
        };

      case 'secondary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: theme.colors.backgroundTertiary,
          },
          text: {
            ...baseTextStyle,
            color: theme.colors.text,
          },
        };

      case 'outline':
        return {
          container: {
            ...baseStyle,
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.colors.border,
          },
          text: {
            ...baseTextStyle,
            color: theme.colors.text,
          },
        };

      case 'ghost':
        return {
          container: {
            ...baseStyle,
            backgroundColor: 'transparent',
          },
          text: {
            ...baseTextStyle,
            color: theme.colors.primary,
          },
        };

      default:
        return {
          container: baseStyle,
          text: baseTextStyle,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const currentSizeStyles = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.container,
        variantStyles.container,
        {
          paddingVertical: currentSizeStyles.paddingVertical,
          paddingHorizontal: currentSizeStyles.paddingHorizontal,
          minHeight: currentSizeStyles.minHeight,
          borderRadius: theme.borderRadius.md,
          opacity: pressed ? 0.7 : 1,
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : theme.colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variantStyles.text,
            {
              fontSize: currentSizeStyles.fontSize,
              fontWeight: theme.typography.fontWeight.semibold,
              fontFamily: theme.typography.fontFamily.regular,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
});
