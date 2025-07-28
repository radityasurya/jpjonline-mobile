import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Share2, RotateCcw, Chrome as Home } from 'lucide-react-native';

interface ResultsActionsProps {
  onShare: () => void;
  onRetry: () => void;
  onHome: () => void;
  isSharing?: boolean;
}

export function ResultsActions({ onShare, onRetry, onHome, isSharing = false }: ResultsActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.shareButton} onPress={onShare} disabled={isSharing}>
        {isSharing ? (
          <ActivityIndicator size="small" color="#2196F3" />
        ) : (
          <Share2 size={20} color="#2196F3" />
        )}
        <Text style={styles.shareButtonText}>Share</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <RotateCcw size={20} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.homeButton} onPress={onHome}>
        <Home size={20} color="#333333" />
        <Text style={styles.homeButtonText}>Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    borderRadius: 8,
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
});