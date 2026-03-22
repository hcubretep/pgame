import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle, G, Ellipse } from 'react-native-svg';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MyDayScreen } from './src/screens/MyDayScreen';
import { MyPlanScreen } from './src/screens/MyPlanScreen';
import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

// Tab icons
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
      fill={color === colors.primary ? color + '20' : 'none'}
    />
  </Svg>
);

const HealthIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 21C12 21 4 14.5 4 9C4 5.5 7 3 9.5 3C11 3 12 4 12 4C12 4 13 3 14.5 3C17 3 20 5.5 20 9C20 14.5 12 21 12 21Z"
      stroke={color}
      strokeWidth={1.8}
      fill={color === colors.primary ? color + '20' : 'none'}
    />
  </Svg>
);

const CommunityIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={9} cy={8} r={3.5} stroke={color} strokeWidth={1.8} fill="none" />
    <Circle cx={16} cy={8} r={3.5} stroke={color} strokeWidth={1.8} fill="none" />
    <Path
      d="M3 20C3 16 5.5 14 9 14C10 14 10.8 14.2 11.5 14.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M12.5 14.5C13.2 14.2 14 14 15 14C18.5 14 21 16 21 20"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

const MoreIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4 6H20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M4 12H20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M4 18H20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const OrcaTabIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.orcaTab, focused && styles.orcaTabActive]}>
    <Svg width={24} height={24} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="18" fill={focused ? colors.primary : '#1A2D4D'} />
      <G transform="translate(6, 6)">
        <Path
          d="M14,4 Q22,4 24,12 Q26,18 22,22 Q18,26 14,26 Q8,26 6,20 Q4,14 6,10 Q8,4 14,4 Z"
          fill={focused ? '#0066CC' : '#111D33'}
        />
        <Path
          d="M10,16 Q10,12 14,12 Q18,12 20,16 Q20,22 16,24 Q12,24 10,20 Z"
          fill="#E8F4FD"
        />
        <Ellipse cx="18" cy="10" rx="3.5" ry="2.2" fill="#E8F4FD" />
        <Circle cx="18.5" cy="10" r="1.2" fill={focused ? '#0066CC' : '#111D33'} />
        <Circle cx="19" cy="9.5" r="0.4" fill="#FFFFFF" />
        <Path d="M14,4 Q15,0 17,2 Q16,4 16,6 Z" fill={focused ? '#0066CC' : '#111D33'} />
      </G>
    </Svg>
  </View>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.tabBarBorder,
            borderTopWidth: 1,
            height: 85,
            paddingBottom: 28,
            paddingTop: 10,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.3,
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Health"
          component={MyDayScreen}
          options={{
            tabBarIcon: ({ color, size }) => <HealthIcon color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Community"
          component={MyPlanScreen}
          options={{
            tabBarIcon: ({ color, size }) => <CommunityIcon color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="More"
          component={MyPlanScreen}
          options={{
            tabBarIcon: ({ color, size }) => <MoreIcon color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Orca"
          component={DashboardScreen}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => <OrcaTabIcon focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  orcaTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: -8,
  },
  orcaTabActive: {
    borderColor: colors.primary + '60',
    backgroundColor: colors.primary + '15',
  },
});
