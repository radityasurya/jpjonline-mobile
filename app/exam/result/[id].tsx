import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

// Import result components
import { ResultsHeader } from '@/components/exam/results/ResultsHeader';
import { PerformanceBreakdown } from '@/components/exam/results/PerformanceBreakdown';
import { QuestionReview } from '@/components/exam/results/QuestionReview';
import { ResultsActions } from '@/components/exam/results/ResultsActions';

export default function ExamResultScreen() {
  const { id: examSlug, resultData } = useLocalSearchParams();
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    loadResultData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examSlug, resultData]);

  // Debug: Log result state changes - moved to top to maintain hook order
  useEffect(() => {
    console.log('Result state changed:', {
      hasResult: !!result,
      resultKeys: result ? Object.keys(result) : [],
      examTitle: result?.examTitle,
      score: result?.score,
      resultsCount: result?.results?.length || 0,
    });
  }, [result]);

  const loadResultData = async () => {
    setIsLoading(true);
    try {
      console.log(
        'Loading result data, examSlug:',
        examSlug,
        'has resultData:',
        !!resultData,
      );

      if (resultData && typeof resultData === 'string') {
        // Data passed from navigation
        console.log('Parsing result data from URL parameter');
        const decodedData = decodeURIComponent(resultData);
        console.log('Decoded data length:', decodedData.length);
        const parsedResult = JSON.parse(decodedData);
        console.log('Parsed result:', {
          examTitle: parsedResult.examTitle,
          score: parsedResult.score,
          passed: parsedResult.passed,
          totalQuestions: parsedResult.totalQuestions,
          hasResults: !!parsedResult.results,
        });
        setResult(parsedResult);
      } else {
        // Try to get result from storage or API
        console.warn(
          'No result data provided, attempting to load from storage',
        );
        // TODO: Load from exam history API when needed
        Alert.alert(
          'Error',
          'No result data provided. Please try taking the exam again.',
        );
        router.replace('/(tabs)/tests');
      }
    } catch (error) {
      console.error('Error loading result data:', error);
      Alert.alert('Error', 'Failed to load exam results. Please try again.');
      router.replace('/(tabs)/tests');
    } finally {
      setIsLoading(false);
    }
  };

  const shareResult = async () => {
    if (!result) return;

    setIsSharing(true);
    try {
      await Share.share({
        message: `I just completed "${result.examTitle}" on JPJOnline and scored ${result.score}%! 🎉\n\nTry your test on JPJOnline now!`,
        title: 'JPJOnline Test Results',
      });
    } catch (error) {
      console.error('Error sharing result:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const retryExam = () => {
    router.replace(`/exam/${examSlug}`);
  };

  const goHome = () => {
    router.replace('/(tabs)');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <ResultsActions onRetry={goHome} onHome={goHome} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ResultsHeader
          examTitle={result.examTitle || 'Exam'}
          score={result.score || 0}
          passed={result.passed || false}
          passingScore={result.passingScore || 80}
          correctAnswers={result.correctAnswers || 0}
          totalQuestions={result.totalQuestions || 0}
          timeSpent={result.timeSpent || 0}
          onShare={shareResult}
          isSharing={isSharing}
        />

        <PerformanceBreakdown
          score={result.score || 0}
          passingScore={result.passingScore || 80}
          correctAnswers={result.correctAnswers || 0}
          totalQuestions={result.totalQuestions || 0}
        />

        {/* Detailed Results */}
        <View style={styles.detailsContainer}>
          {result.results && result.results.length > 0 ? (
            result.results.map((questionResult: any, index: number) => (
              <QuestionReview
                key={index}
                questionResult={questionResult}
                questionIndex={index}
              />
            ))
          ) : (
            <Text style={styles.noResultsText}>
              No detailed results available
            </Text>
          )}
        </View>
      </ScrollView>

      <ResultsActions onRetry={retryExam} onHome={goHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  detailsContainer: {
    margin: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});
