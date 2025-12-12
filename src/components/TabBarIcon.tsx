import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface TabBarIconProps {
  name: string;
  color: string;
  size?: number;
}

function TabBarIcon({ name, color, size = 24 }: TabBarIconProps) {
  return <Icon name={name} size={size} color={color} />;
}

export default TabBarIcon;
