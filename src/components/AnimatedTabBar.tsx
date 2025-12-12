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

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({
  icon,
  label,
  isFocused,
  onPress,
  onLongPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {icon}
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
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isTabBarVisible ? 0 : 65 + insets.bottom,
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
          height: 65 + insets.bottom,
          transform: [{ translateY }],
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
                color: isFocused ? colors.primary : '#8E8E93',
                size: 24,
              })
            : null;

          return (
            <TabItem
              key={route.key}
              icon={icon}
              label={label as string}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
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
    borderTopColor: '#E5E5EA',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
});

export default AnimatedTabBar;
