import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';

interface QuestionDisplayProps {
  question: any;
  questionIndex: number;
}

export function QuestionDisplay({
  question,
  questionIndex,
}: QuestionDisplayProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionNumber}>Question {questionIndex + 1}</Text>

      {question.image && (
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color="#facc15" />
              <Text style={styles.loadingText}>Loading image...</Text>
            </View>
          )}
          {!imageError && (
            <Image
              source={{ uri: question.image }}
              style={[styles.questionImage, imageLoading && styles.hiddenImage]}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              resizeMode="cover"
            />
          )}
          {imageError && (
            <View style={styles.imageErrorContainer}>
              <Text style={styles.imageErrorText}>Failed to load image</Text>
            </View>
          )}
        </View>
      )}

      {question.text && question.text.trim() && (
        <Text style={styles.questionText}>{question.text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  questionContainer: {
    marginBottom: 30,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    marginVertical: 16,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  hiddenImage: {
    opacity: 0,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    height: 200,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  imageErrorContainer: {
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imageErrorText: {
    fontSize: 14,
    color: '#999999',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    lineHeight: 26,
  },
});
