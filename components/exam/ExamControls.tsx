import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2, VolumeX, Lock, Clock as Unlock } from 'lucide-react-native';

interface ExamControlsProps {
  isSoundEnabled: boolean;
  examMode: 'OPEN' | 'CLOSED';
  onToggleSound: () => void;
  onToggleMode: () => void;
}

export function ExamControls({
  isSoundEnabled,
  examMode,
  onToggleSound,
  onToggleMode,
}: ExamControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.controlButton, styles.soundButton]}
        onPress={onToggleSound}
      >
        {isSoundEnabled ? (
          <Volume2 size={18} color="#4CAF50" />
        ) : (
          <VolumeX size={18} color="#FF3B30" />
        )}
        <Text
          style={[
            styles.controlText,
            { color: isSoundEnabled ? '#4CAF50' : '#FF3B30' },
          ]}
        >
          Sound {isSoundEnabled ? 'On' : 'Off'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, styles.modeButton]}
        onPress={onToggleMode}
      >
        {examMode === 'CLOSED' ? (
          <Lock size={18} color="#FF9800" />
        ) : (
          <Unlock size={18} color="#2196F3" />
        )}
        <Text
          style={[
            styles.controlText,
            { color: examMode === 'CLOSED' ? '#FF9800' : '#2196F3' },
          ]}
        >
          {examMode} Mode
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  soundButton: {
    minWidth: 100,
  },
  modeButton: {
    minWidth: 120,
  },
  controlText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});
