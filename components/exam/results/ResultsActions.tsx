import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RefreshCw, Home, ArrowLeft } from 'lucide-react-native';

interface ResultsActionsProps {
  onRetry: () => void;
  onHome: () => void;
}

export function ResultsActions({ onRetry, onHome }: ResultsActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={onHome}>
        <ArrowLeft size={20} color="#333333" />
        <Text style={styles.homeButtonText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <RefreshCw size={20} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
});
