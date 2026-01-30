import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useTabBar } from '../context/TabBarContext';
import { useCart } from '../context/CartContext';

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  badge?: number;
}

const TabItem: React.FC<TabItemProps> = ({
  icon,
  label,
  isFocused,
  onPress,
  onLongPress,
  badge,
}) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [isFocused, scaleAnim]);

  const translateY = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <Animated.View
          style={[
            styles.iconContainer,
            isFocused && styles.activeIconContainer,
            {
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          {icon}
        </Animated.View>
        {badge !== undefined && badge > 0 && (
          <View style={styles?.badgeContainer}>
            <Text style={styles?.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.label,
          {
            color: isFocused ? colors.primary : '#8E8E93',
            fontWeight: isFocused ? '600' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const AnimatedTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { isTabBarVisible } = useTabBar();
  const { getTotalQuantity } = useCart();
  const translateY = useRef(new Animated.Value(0)).current;
  const cartBadgeCount = getTotalQuantity();

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isTabBarVisible ? 0 : 56 + insets.bottom,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isTabBarVisible, translateY, insets.bottom]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          height: 56 + insets.bottom,
          transform: [{ translateY }],
          overflow: isTabBarVisible ? 'visible' : 'hidden',
        },
      ]}
    >
      {/* Tab items */}
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const icon = options.tabBarIcon
            ? options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? '#FFFFFF' : '#8E8E93',
                size: 24,
              })
            : null;

          // Settings tab'ında sepet badge'i göster
          const badge = route.name === 'Settings' ? cartBadgeCount : undefined;

          return (
            <TabItem
              key={route.key}
              icon={icon}
              label={label as string}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              badge={badge}
            />
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: '#E5E5EA',
    borderLeftColor: '#E5E5EA',
    borderRightColor: '#E5E5EA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // Make the tab bar part of the normal layout flow so
    // screens are rendered above it instead of being hidden
    // underneath an absolutely positioned bar.
    position: 'relative',
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 4,
  },
  iconWrapper: {
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 37,
    height: 37,
    borderRadius: 20,
  },
  activeIconContainer: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default AnimatedTabBar;
