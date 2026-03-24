import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface SectionHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
  rightAction?: string;
  onRightPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  rightElement,
  rightAction,
  onRightPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {rightElement}
      {rightAction && (
        <TouchableOpacity onPress={onRightPress}>
          <Text style={styles.action}>{rightAction}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface PlatformPillProps {
  icon: string;
  label: string;
  time?: string;
  value?: string;
  color?: string;
  active?: boolean;
}

export const PlatformPill: React.FC<PlatformPillProps> = ({
  icon,
  label,
  time,
  value,
  color = colors.primary,
  active = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        active && { backgroundColor: color + '20', borderColor: color + '40' },
      ]}
      activeOpacity={0.7}
    >
      <View style={[styles.pillIcon, { backgroundColor: color + '25' }]}>
        <Text style={styles.pillEmoji}>{icon}</Text>
      </View>
      <View style={styles.pillContent}>
        <Text style={styles.pillLabel}>{label}</Text>
        {time && <Text style={styles.pillTime}>{time}</Text>}
      </View>
      {value && (
        <Text style={[styles.pillValue, { color }]}>{value}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  action: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pillEmoji: {
    fontSize: 18,
  },
  pillContent: {
    flex: 1,
  },
  pillLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  pillTime: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  pillValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
