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
import { SectionHeader, PlatformPill } from '../components/SectionHeader';
import { SubtleWaves } from '../components/WaveBackground';

const FilterPill: React.FC<{ label: string; active?: boolean; color?: string }> = ({
  label,
  active,
  color = colors.textSecondary,
}) => (
  <TouchableOpacity
    style={[styles.filterPill, active && { borderColor: color + '50' }]}
    activeOpacity={0.7}
  >
    <View style={[styles.filterDot, { backgroundColor: active ? color : colors.textMuted }]} />
    <Text style={[styles.filterText, active && { color }]}>{label}</Text>
  </TouchableOpacity>
);

const ExpandIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18">
    <Path d="M4 7L9 12L14 7" stroke={colors.textMuted} strokeWidth={1.5} strokeLinecap="round" fill="none" />
  </Svg>
);

const JournalDot: React.FC<{ day: string; filled: boolean; today?: boolean }> = ({
  day,
  filled,
  today,
}) => (
  <View style={styles.journalDay}>
    <Text style={[styles.journalDayLabel, today && { color: colors.textPrimary, fontWeight: '700' }]}>
      {day}
    </Text>
    <View
      style={[
        styles.journalDot,
        filled
          ? { backgroundColor: colors.teal }
          : { borderWidth: 1.5, borderColor: colors.textMuted },
      ]}
    >
      {filled && (
        <Svg width={10} height={10} viewBox="0 0 10 10">
          <Path d="M2.5 5L4.5 7L7.5 3" stroke="#FFF" strokeWidth={1.5} strokeLinecap="round" fill="none" />
        </Svg>
      )}
    </View>
  </View>
);

export const MyDayScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SubtleWaves top={300} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter bar */}
        <View style={styles.filterRow}>
          <FilterPill label="VISIBILITY" color={colors.visibility} />
          <FilterPill label="SENTIMENT" color={colors.sentiment} />
          <FilterPill label="CITATIONS" color={colors.citations} />
        </View>

        {/* My Day header */}
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
          <Svg width={16} height={16} viewBox="0 0 16 16">
            <Path d="M6 4L10 8L6 12" stroke={colors.textMuted} strokeWidth={1.5} strokeLinecap="round" fill="none" />
          </Svg>
        </TouchableOpacity>

        {/* Today's AI Mentions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY'S AI MENTIONS</Text>
          <TouchableOpacity>
            <ExpandIcon />
          </TouchableOpacity>
        </View>

        <PlatformPill
          icon="🤖"
          label="ChatGPT"
          time="12 mentions today"
          value="+23%"
          color={colors.teal}
          active
        />
        <PlatformPill
          icon="🟣"
          label="Claude"
          time="8 mentions today"
          value="+15%"
          color={colors.primary}
        />
        <PlatformPill
          icon="💎"
          label="Gemini"
          time="5 mentions today"
          value="+8%"
          color={colors.amber}
        />
        <PlatformPill
          icon="🔍"
          label="Perplexity"
          time="3 mentions today"
          value="-2%"
          color={colors.coral}
        />

        {/* Add / Start buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>+</Text>
            <Text style={styles.actionText}>ADD QUERY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]}>
            <Text style={styles.actionIcon}>◉</Text>
            <Text style={styles.actionText}>START MONITOR</Text>
          </TouchableOpacity>
        </View>

        {/* Tonight's Sleep = Tomorrow's Crawl */}
        <View style={styles.sleepSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>NEXT CRAWL WINDOW</Text>
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Path d="M6 4L10 8L6 12" stroke={colors.textMuted} strokeWidth={1.5} strokeLinecap="round" fill="none" />
            </Svg>
          </View>
          <View style={styles.sleepTimes}>
            <View style={styles.sleepItem}>
              <Text style={styles.sleepEmoji}>🌊</Text>
              <Text style={styles.sleepTime}>2:00 AM</Text>
              <Text style={styles.sleepLabel}>SCHEDULED CRAWL</Text>
            </View>
            <View style={styles.sleepDivider} />
            <View style={styles.sleepItem}>
              <Text style={styles.sleepEmoji}>⏰</Text>
              <Text style={[styles.sleepTime, { color: colors.teal }]}>AUTO</Text>
              <Text style={styles.sleepLabel}>ALERT MODE</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.alarmButton}>
            <Text style={styles.alarmIcon}>⏰</Text>
            <Text style={styles.alarmText}>SET ALERT</Text>
          </TouchableOpacity>
        </View>

        {/* My Journal = Tracking Log */}
        <View style={styles.journalSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>MY JOURNAL</Text>
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Path d="M6 4L10 8L6 12" stroke={colors.textMuted} strokeWidth={1.5} strokeLinecap="round" fill="none" />
            </Svg>
          </View>
          <View style={styles.journalRow}>
            <JournalDot day="SAT" filled />
            <JournalDot day="SUN" filled />
            <JournalDot day="MON" filled={false} />
            <JournalDot day="TUE" filled />
            <JournalDot day="WED" filled />
            <JournalDot day="THU" filled />
            <JournalDot day="FRI" filled={false} today />
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
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
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  outlookIcon: {
    fontSize: 16,
  },
  outlookText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonOutline: {
    borderColor: colors.primary + '40',
  },
  actionIcon: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sleepSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sleepTimes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  sleepItem: {
    alignItems: 'center',
    gap: 4,
  },
  sleepEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  sleepTime: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  sleepLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sleepDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
  },
  alarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceHover,
    borderRadius: 12,
    paddingVertical: 12,
  },
  alarmIcon: {
    fontSize: 14,
  },
  alarmText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  journalSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  journalRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  journalDay: {
    alignItems: 'center',
    gap: 8,
  },
  journalDayLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  journalDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
