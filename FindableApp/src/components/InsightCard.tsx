import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

interface InsightCardProps {
  title: string;
  description: string;
  badgeCount?: number;
  checked?: boolean;
}

const CheckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16">
    <Path
      d="M3 8.5L6.5 12L13 4"
      stroke={colors.teal}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  badgeCount,
  checked,
}) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.actions}>
        {checked && (
          <View style={styles.checkCircle}>
            <CheckIcon />
          </View>
        )}
        {badgeCount !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

interface StatusCardProps {
  title: string;
  statusLabel: string;
  statusColor: string;
  detail: string;
  icon?: React.ReactNode;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  statusLabel,
  statusColor,
  detail,
  icon,
}) => {
  return (
    <TouchableOpacity style={styles.statusCard} activeOpacity={0.7}>
      <Text style={styles.statusTitle}>{title}</Text>
      <View style={styles.statusRow}>
        {icon}
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {statusLabel}
        </Text>
      </View>
      <Text style={styles.statusDetail}>{detail}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    gap: 8,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.surfaceHover,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusDetail: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
});
