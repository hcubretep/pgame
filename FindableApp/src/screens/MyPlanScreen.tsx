import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../theme/colors';
import { OrcaAvatar } from '../components/OrcaIcon';
import { SubtleWaves } from '../components/WaveBackground';

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

interface GoalItemProps {
  title: string;
  progress: string;
  total: string;
  completed: boolean;
  color: string;
}

const GoalItem: React.FC<GoalItemProps> = ({ title, progress, total, completed, color }) => (
  <View style={styles.goalItem}>
    <Text style={[styles.goalTitle, completed && { color }]}>{title}</Text>
    <View style={styles.goalProgress}>
      <Text style={[styles.goalCount, { color: completed ? color : colors.textSecondary }]}>
        {progress}
      </Text>
    </View>
  </View>
);

const MiniRing: React.FC<{ progress: number; color: string; size?: number }> = ({
  progress,
  color,
  size = 40,
}) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.cardBackgroundLight}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
      />
    </Svg>
  );
};

interface DashboardMetricProps {
  label: string;
  value: string;
  change?: string;
  changeColor?: string;
}

const DashboardMetric: React.FC<DashboardMetricProps> = ({
  label,
  value,
  change,
  changeColor,
}) => (
  <TouchableOpacity style={styles.dashMetric} activeOpacity={0.7}>
    <View style={styles.dashMetricRow}>
      <Text style={styles.dashMetricLabel}>{label}</Text>
      <View style={styles.dashMetricValue}>
        <Text style={styles.dashMetricNumber}>{value}</Text>
        {change && (
          <Text style={[styles.dashMetricChange, { color: changeColor }]}>{change}</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export const MyPlanScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SubtleWaves top={200} />

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

        {/* Filter bar */}
        <View style={styles.filterRow}>
          <View style={[styles.filterDot, { backgroundColor: colors.visibility }]} />
          <Text style={styles.filterLabel}>VISIBILITY</Text>
          <View style={[styles.filterDot, { backgroundColor: colors.sentiment }]} />
          <Text style={styles.filterLabel}>SENTIMENT</Text>
          <View style={[styles.filterDot, { backgroundColor: colors.citations }]} />
          <Text style={styles.filterLabel}>CITATIONS</Text>
        </View>

        {/* My Plan Section */}
        <Text style={styles.sectionTitle}>My Plan</Text>

        {/* Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>CUSTOM PLAN</Text>
              <Text style={styles.planDays}>3 days left</Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 20 20">
              <Path d="M10 4V10L14 14" stroke={colors.textMuted} strokeWidth={1.5} strokeLinecap="round" fill="none" />
            </Svg>
          </View>

          {/* Progress bar */}
          <Text style={styles.progressLabel}>
            <Text style={{ fontWeight: '800', fontSize: 22 }}>57</Text>% ACCOMPLISHED
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '57%' }]} />
          </View>

          {/* Goals */}
          <View style={styles.goalsList}>
            <GoalItem
              title="4,500+ Monthly Impressions"
              progress="2/7"
              total="7"
              completed={false}
              color={colors.textSecondary}
            />
            <GoalItem
              title="80+ Sentiment Score"
              progress="0/7"
              total="7"
              completed={false}
              color={colors.textSecondary}
            />
            <GoalItem
              title="1:10+ Cited in AI Responses"
              progress="2:02"
              total=""
              completed={true}
              color={colors.teal}
            />
            <GoalItem
              title="Any Content Published"
              progress="2/2"
              total="2"
              completed={true}
              color={colors.teal}
            />
          </View>

          <TouchableOpacity style={styles.viewPlanButton}>
            <Text style={styles.viewPlanText}>VIEW MY PLAN</Text>
          </TouchableOpacity>
        </View>

        {/* My Dashboard */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.sectionTitle}>My Dashboard</Text>
          <TouchableOpacity style={styles.customizeBadge}>
            <Text style={styles.customizeText}>CUSTOMIZE</Text>
            <Text style={styles.customizeIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        <DashboardMetric
          label="HEART RATE VARIABILITY"
          value="85"
          change="↓ 91"
          changeColor={colors.textMuted}
        />

        {/* Repurposed for Findable metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricGridItem}>
            <View style={styles.metricGridRow}>
              <MiniRing progress={0.73} color={colors.visibility} />
              <View style={styles.metricGridContent}>
                <Text style={styles.metricGridLabel}>AI VISIBILITY</Text>
                <Text style={styles.metricGridValue}>73%</Text>
              </View>
            </View>
          </View>
          <View style={styles.metricGridItem}>
            <View style={styles.metricGridRow}>
              <MiniRing progress={0.82} color={colors.sentiment} />
              <View style={styles.metricGridContent}>
                <Text style={styles.metricGridLabel}>BRAND SENTIMENT</Text>
                <Text style={styles.metricGridValue}>82</Text>
              </View>
            </View>
          </View>
          <View style={styles.metricGridItem}>
            <View style={styles.metricGridRow}>
              <MiniRing progress={0.47} color={colors.citations} />
              <View style={styles.metricGridContent}>
                <Text style={styles.metricGridLabel}>CITATIONS</Text>
                <Text style={styles.metricGridValue}>47</Text>
              </View>
            </View>
          </View>
          <View style={styles.metricGridItem}>
            <View style={styles.metricGridRow}>
              <MiniRing progress={1.0} color={colors.success} />
              <View style={styles.metricGridContent}>
                <Text style={styles.metricGridLabel}>CRAWLER HEALTH</Text>
                <Text style={styles.metricGridValue}>100%</Text>
              </View>
            </View>
          </View>
        </View>

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
    marginBottom: 16,
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  filterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginRight: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  planDays: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  progressLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceHover,
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 3,
  },
  goalsList: {
    gap: 14,
    marginBottom: 16,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  goalProgress: {
    backgroundColor: colors.surfaceHover,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  goalCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewPlanButton: {
    backgroundColor: colors.surfaceHover,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  viewPlanText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginTop: 28,
    marginBottom: 4,
  },
  customizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.coral + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  customizeText: {
    color: colors.coral,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  customizeIcon: {
    fontSize: 10,
  },
  dashMetric: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dashMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashMetricLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    flex: 1,
  },
  dashMetricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  dashMetricNumber: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  dashMetricChange: {
    fontSize: 13,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 4,
  },
  metricGridItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 14,
    width: '48.5%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricGridContent: {
    flex: 1,
  },
  metricGridLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricGridValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
});
