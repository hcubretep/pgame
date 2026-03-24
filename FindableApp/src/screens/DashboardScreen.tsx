import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { CircularProgress } from '../components/CircularProgress';
import { InsightCard, StatusCard } from '../components/InsightCard';
import { SectionHeader } from '../components/SectionHeader';
import { OrcaAvatar } from '../components/OrcaIcon';
import { WaveBackground } from '../components/WaveBackground';

const ChevronLeft = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Path d="M12 4L6 10L12 16" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" fill="none" />
  </Svg>
);

const ChevronRight = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Path d="M8 4L14 10L8 16" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" fill="none" />
  </Svg>
);

const BatteryIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Path
      d="M3 6H15C15.5523 6 16 6.44772 16 7V13C16 13.5523 15.5523 14 15 14H3C2.44772 14 2 13.5523 2 13V7C2 6.44772 2.44772 6 3 6Z"
      stroke={colors.primary}
      strokeWidth={1.5}
      fill="none"
    />
    <Path d="M17 9V11" stroke={colors.primary} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M5 8H10C10.5 8 11 8.5 11 9V11C11 11.5 10.5 12 10 12H5C4.5 12 4 11.5 4 11V9C4 8.5 4.5 8 5 8Z" fill={colors.primary} />
  </Svg>
);

const CheckCircle = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16">
    <Circle cx={8} cy={8} r={7} fill={colors.success} opacity={0.2} />
    <Path d="M5 8L7 10.5L11 5.5" stroke={colors.success} strokeWidth={1.5} strokeLinecap="round" fill="none" />
  </Svg>
);

const WarningIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16">
    <Path d="M8 2L15 14H1L8 2Z" fill={colors.warning} opacity={0.2} />
    <Path d="M8 6V10" stroke={colors.warning} strokeWidth={1.5} strokeLinecap="round" />
    <Circle cx={8} cy={12} r={0.8} fill={colors.warning} />
  </Svg>
);

export const DashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <WaveBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <OrcaAvatar size={36} />
          <View style={styles.dateNav}>
            <TouchableOpacity><ChevronLeft /></TouchableOpacity>
            <Text style={styles.dateLabel}>TODAY</Text>
            <TouchableOpacity><ChevronRight /></TouchableOpacity>
          </View>
          <View style={styles.batteryRow}>
            <Text style={styles.batteryText}>73%</Text>
            <BatteryIcon />
          </View>
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>FINDABLE</Text>

        {/* Three Circular Metrics */}
        <View style={styles.metricsRow}>
          <CircularProgress
            value={73}
            color={colors.visibility}
            colorEnd="#4DA6FF"
            label="Visibility"
            size={100}
          />
          <CircularProgress
            value={82}
            color={colors.sentiment}
            colorEnd="#34D399"
            label="Sentiment"
            size={100}
          />
          <CircularProgress
            value={47}
            maxValue={100}
            color={colors.citations}
            colorEnd="#C4B5FD"
            label="Citations"
            unit=""
            size={100}
          />
        </View>

        {/* Insight Card */}
        <InsightCard
          title="Visibility Surge Detected"
          description="Your brand mentions on ChatGPT increased 23% this week. Claude citations are trending up too — your content optimization is making waves."
          checked
          badgeCount={3}
        />

        {/* Status Cards Row */}
        <View style={styles.statusRow}>
          <StatusCard
            title="Crawler Health"
            statusLabel="All Clear"
            statusColor={colors.success}
            detail="26/26 Bots Allowed"
            icon={<CheckCircle />}
          />
          <View style={{ width: 10 }} />
          <StatusCard
            title="Core Vitals"
            statusLabel="Fast"
            statusColor={colors.success}
            detail="LCP 1.2s · CLS 0.00"
            icon={<CheckCircle />}
          />
        </View>

        {/* My Day Section */}
        <SectionHeader
          title="My Day"
          rightElement={
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          }
        />

        {/* Daily Outlook */}
        <TouchableOpacity style={styles.outlookCard}>
          <Text style={styles.outlookIcon}>🔱</Text>
          <Text style={styles.outlookText}>Your Daily Outlook</Text>
          <ChevronRight />
        </TouchableOpacity>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 12,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '300',
  },
  outlookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  outlookIcon: {
    fontSize: 18,
  },
  outlookText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
