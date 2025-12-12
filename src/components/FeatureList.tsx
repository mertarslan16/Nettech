import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ProductFeature } from '../types/product';
// import colors from '../theme/colors';

interface FeatureListProps {
  features: ProductFeature[];
  title?: string;
}

function FeatureList({ features, title = 'Özellikler' }: FeatureListProps) {
  if (features.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View
            key={index}
            style={[
              styles.featureRow,
              index === features.length - 1 && styles.lastRow,
            ]}
          >
            <View style={styles.featureNameContainer}>
              <View style={styles.dot} />
              <Text style={styles.featureName}>{feature.name}</Text>
            </View>
            <Text style={styles.featureValue}>{feature.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  featuresContainer: {
    padding: 4,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  featureNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'colors.primary',
    marginRight: 10,
  },
  featureName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
});

export default FeatureList;
