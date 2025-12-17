import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import {
  CircleCheck as CheckCircle,
  Circle as XCircle,
} from 'lucide-react-native';
import { RetryImage } from '@/components/shared/RetryImage';
import { convertImageUrl } from '@/utils/markdownImageHandler';

interface QuestionReviewProps {
  questionResult: {
    questionId: string;
    question: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
    questionImage?: string;
    options: any;
    optionImages?: string[];
  };
  questionIndex: number;
}

export function QuestionReview({
  questionResult,
  questionIndex,
}: QuestionReviewProps) {
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState('');

  // Markdown styles for question text
  const markdownStyles = useMemo(() => ({
    body: {
      color: '#333333',
    },
    text: {
      fontSize: 16,
      color: '#333333',
      lineHeight: 22,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 8,
      fontSize: 16,
      color: '#333333',
      lineHeight: 22,
    },
    strong: {
      fontWeight: '900' as const,
      color: '#000000',
    },
    em: {
      fontStyle: 'italic' as const,
      color: '#333333',
    },
    list_item: {
      flexDirection: 'row' as const,
      marginBottom: 4,
      fontSize: 16,
      color: '#333333',
      lineHeight: 22,
    },
    bullet_list: {
      marginTop: 8,
      marginBottom: 8,
    },
    ordered_list: {
      marginTop: 8,
      marginBottom: 8,
    },
    bullet_list_icon: {
      fontSize: 16,
      lineHeight: 22,
      marginRight: 8,
    },
    ordered_list_icon: {
      fontSize: 16,
      lineHeight: 22,
      marginRight: 8,
    },
  }), []);

  // Custom rules for markdown rendering
  const markdownRules = useMemo(() => ({
    image: (node: any) => {
      const imageUrl = convertImageUrl(node.attributes.src);
      return (
        <View key={node.key} style={styles.markdownImageContainer}>
          <RetryImage
            uri={imageUrl}
            style={styles.markdownImage}
            resizeMode="contain"
            maxRetries={3}
            retryDelay={2000}
          />
        </View>
      );
    },
  }), []);

  const renderAnswerOption = (option: any, index: number) => {
    const isUserAnswer = questionResult.userAnswer === index;
    const isCorrectAnswer = questionResult.correctAnswer === index;

    // Get option image from optionImages array or from option object
    const optionImages = questionResult.optionImages || [];
    const rawOptionImageUrl =
      optionImages[index] || (typeof option === 'object' ? option.image : null);
    const optionImageUrl = rawOptionImageUrl ? convertImageUrl(rawOptionImageUrl) : null;
    const hasImage = optionImageUrl && optionImageUrl.trim() !== '';

    const hasText =
      typeof option === 'string' ||
      (typeof option === 'object' && option.text && option.text.trim());

    return (
      <View
        key={index}
        style={[
          styles.answerOption,
          isUserAnswer &&
            (questionResult.isCorrect
              ? styles.correctUserAnswer
              : styles.incorrectUserAnswer),
          isCorrectAnswer && !isUserAnswer && styles.correctAnswer,
        ]}
      >
        <View style={styles.answerHeader}>
          <Text style={styles.answerLetter}>
            {String.fromCharCode(65 + index)}
          </Text>
          {isUserAnswer && (
            <View style={styles.answerIndicator}>
              <Text style={styles.answerIndicatorText}>Your Answer</Text>
              {questionResult.isCorrect ? (
                <CheckCircle size={16} color="#4CAF50" />
              ) : (
                <XCircle size={16} color="#FF3B30" />
              )}
            </View>
          )}
          {isCorrectAnswer && !isUserAnswer && (
            <View style={styles.answerIndicator}>
              <Text style={styles.answerIndicatorText}>Correct Answer</Text>
              <CheckCircle size={16} color="#4CAF50" />
            </View>
          )}
        </View>

        {hasImage && (
          <RetryImage
            uri={optionImageUrl}
            style={styles.optionImage}
            containerStyle={styles.optionImageContainer}
            resizeMode="contain"
            maxRetries={3}
            retryDelay={2000}
            loadingSize="small"
            loadingColor="#666666"
          />
        )}

        {hasText && (
          <Text style={styles.answerText}>
            {typeof option === 'string' ? option : option.text}
          </Text>
        )}
      </View>
    );
  };

  const options = Array.isArray(questionResult.options)
    ? questionResult.options
    : questionResult.options?.choices || [];

  return (
    <View style={styles.container}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>Question {questionIndex + 1}</Text>
        {questionResult.isCorrect ? (
          <CheckCircle size={20} color="#4CAF50" />
        ) : (
          <XCircle size={20} color="#FF3B30" />
        )}
      </View>

      {questionResult.questionImage && (
        <RetryImage
          uri={convertImageUrl(questionResult.questionImage)}
          style={styles.questionImage}
          containerStyle={styles.questionImageContainer}
          resizeMode="contain"
          maxRetries={3}
          retryDelay={2000}
        />
      )}

      {questionResult.question && questionResult.question.trim() && (
        <Markdown
          style={markdownStyles}
          rules={markdownRules}
        >
          {questionResult.question}
        </Markdown>
      )}

      <View style={styles.answersContainer}>
        {options.map((option: any, index: number) =>
          renderAnswerOption(option, index),
        )}
      </View>

      {questionResult.explanation && (
        <View style={styles.explanation}>
          <Text style={styles.explanationTitle}>Explanation:</Text>
          <Text style={styles.explanationText}>
            {questionResult.explanation}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  questionImageContainer: {
    marginBottom: 16,
    height: 200,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  markdownImageContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  markdownImage: {
    width: '100%',
    minHeight: 150,
    height: undefined,
    aspectRatio: 1,
    borderRadius: 8,
  },
  answersContainer: {
    gap: 8,
    marginBottom: 16,
  },
  answerOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  correctUserAnswer: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  incorrectUserAnswer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  correctAnswer: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  answerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answerIndicatorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  optionImageContainer: {
    marginBottom: 8,
    height: 120,
  },
  optionImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
  },
  answerText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  explanation: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});
