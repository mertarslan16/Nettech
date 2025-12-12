import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
// import colors from '../theme/colors';

interface InfoRow {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
}

interface InfoTableProps {
  rows: InfoRow[];
}

function InfoTable({ rows }: InfoTableProps) {
  return (
    <View style={styles.container}>
      {rows.map((row, index) => (
        <View
          key={index}
          style={[
            styles.row,
            index === rows.length - 1 && styles.lastRow,
            index % 2 === 0 && styles.evenRow,
          ]}
        >
          <Text style={styles.label}>{row.label}</Text>
          <Text style={[styles.value, row.highlight && styles.valueHighlight]}>
            {row.value}
            {row.suffix ? ` ${row.suffix}` : ''}
          </Text>
        </View>
      ))}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  evenRow: {
    backgroundColor: '#fafafa',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  valueHighlight: {
    color: '#F99D26',
    fontSize: 16,
  },
});

export default InfoTable;
