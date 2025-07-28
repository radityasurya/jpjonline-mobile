import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import api from '@/services/api';

// Import result components
import { ResultsHeader } from '@/components/exam/results/ResultsHeader';
import { PerformanceBreakdown } from '@/components/exam/results/PerformanceBreakdown';
import { QuestionReview } from '@/components/exam/results/QuestionReview';
import { ResultsActions } from '@/components/exam/results/ResultsActions';

export default function ExamResultScreen() {
  const { id, resultData } = useLocalSearchParams();
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    loadResultData();
  }, [resultData]);

  const loadResultData = async () => {
    setIsLoading(true);
    try {
      if (resultData) {
        // Data passed from navigation
        const parsedResult = JSON.parse(decodeURIComponent(resultData as string));
        setResult(parsedResult);
        
        // Load questions for detailed review
        if (parsedResult.examId) {
          const examResponse = await api.exams.fetchExamQuestions(parsedResult.examId);
          if (examResponse.success) {
            setQuestions(examResponse.data!.questions);
          }
        }
      } else {
        // Try to load from localStorage using exam ID
        const storedResults = await api.exams.getExamResults();
        if (storedResults.success) {
          const examResults = storedResults.data!.filter(r => r.examId === id);
          if (examResults.length > 0) {
            // Get the most recent result for this exam
            const latestResult = examResults.sort((a, b) => 
              new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            )[0];
            setResult(latestResult);
            
            // Load questions for detailed review
            const examResponse = await api.exams.fetchExamQuestions(id as string);
            if (examResponse.success) {
              setQuestions(examResponse.data!.questions);
            }
          } else {
            Alert.alert('Error', 'No results found for this exam.');
            router.back();
          }
        }
      }
    } catch (error) {
      console.error('Error loading result data:', error);
      Alert.alert('Error', 'Failed to load exam results.');
      router.back();
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
    router.replace(`/exam/${id}`);
  };

  const goHome = () => {
    router.replace('/(tabs)');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFEEB4" />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <ResultsActions
          onShare={() => {}}
          onRetry={goHome}
          onHome={goHome}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ResultsHeader
          examTitle={result.examTitle}
          score={result.score}
          passed={result.passed}
          passingScore={result.passingScore}
          correctAnswers={result.correctAnswers}
          totalQuestions={result.totalQuestions}
          timeSpent={result.timeSpent}
        />

        <PerformanceBreakdown
          score={result.score}
          passingScore={result.passingScore}
          correctAnswers={result.correctAnswers}
          totalQuestions={result.totalQuestions}
        />

        {/* Detailed Results */}
        <View style={styles.detailsContainer}>
          {result.results && result.results.map((questionResult: any, index: number) => {
            const question = questions[index];
            return (
            <QuestionReview
              key={index}
              questionResult={{
                ...questionResult,
                questionImage: question?.image,
                options: question?.options || questionResult.options
              }}
              questionIndex={index}
            />
            );
          })}
        </View>
      </ScrollView>

      <ResultsActions
        onShare={shareResult}
        onRetry={retryExam}
        onHome={goHome}
        isSharing={isSharing}
      />
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
});