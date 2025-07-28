import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';
import { getExamBySlug, submitExamResults, updateStats } from '@/services';
import { activityService, ACTIVITY_TYPES } from '@/services';

// Types for the new API structure
interface ApiQuestion {
  id: string;
  text: string;
  options: string[];
  answerIndex: number;
  explanation: string | null;
  imageUrl: string | null;
  order: number;
}

interface ApiExam {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: {
    id: string;
    name: string;
  };
  questions: ApiQuestion[];
}
// Import components
import { ExamHeader } from '@/components/exam/ExamHeader';
import { ExamProgress } from '@/components/exam/ExamProgress';
import { QuestionDisplay } from '@/components/exam/QuestionDisplay';
import { AnswerOptions } from '@/components/exam/AnswerOptions';
import { ExamNavigation } from '@/components/exam/ExamNavigation';
import { QuestionSidebar } from '@/components/exam/QuestionSidebar';

export default function ExamScreen() {
  const { id: examSlug } = useLocalSearchParams();
  const { user } = useAuth();
  const [exam, setExam] = useState<ApiExam | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [answerValidation, setAnswerValidation] = useState<boolean[]>([]);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionSidebar, setShowQuestionSidebar] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const handleExitExam = () => {
    logger.userAction('Exam exit requested');
    Alert.alert(
      'Exit Exam',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            logger.userAction('Exam exited', { examSlug });
            router.back();
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchExamData();
  }, [examSlug]);

  const fetchExamData = async () => {
    setIsLoading(true);
    logger.info('ExamScreen', 'Loading exam data', { examSlug });
    try {
      const examData = await getExamBySlug(examSlug as string, user?.token || 'mock-token');
      logger.info('ExamScreen', 'Exam data loaded successfully', {
        examSlug,
        questionsCount: examData.questions.length,
        examTitle: examData.title
      });
      setExam(examData);
      setQuestions(examData.questions);
      setAnswers(new Array(examData.questions.length).fill(-1));
      setAnswerValidation(
        new Array(examData.questions.length).fill(false)
      );
      setHasCheckedAnswer(
        new Array(examData.questions.length).fill(false)
      );
      
      // Track exam start activity
      activityService.addActivity(ACTIVITY_TYPES.EXAM_STARTED, {
        examId: examData.id,
        examSlug: examData.slug,
        examTitle: examData.title,
        category: examData.category?.name,
        userId: user?.id
      });
      
    } catch (error) {
      logger.error('ExamScreen', 'Failed to load exam data', error);
      Alert.alert('Error', 'Failed to load exam. Please try again.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    logger.debug('ExamScreen', 'Answer selected', { 
      questionIndex: currentQuestionIndex, 
      answerIndex 
    });
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);

    // Reset validation for this question when answer changes
    const newHasChecked = [...hasCheckedAnswer];
    newHasChecked[currentQuestionIndex] = false;
    setHasCheckedAnswer(newHasChecked);
  };

  const handleCheckAnswer = () => {
    if (answers[currentQuestionIndex] === -1) {
      logger.warn('ExamScreen', 'Check answer attempted with no selection');
      Alert.alert('No Answer Selected', 'Please select an answer first.');
      return;
    }

    logger.userAction('Answer checked', { 
      questionIndex: currentQuestionIndex,
      selectedAnswer: answers[currentQuestionIndex],
      correctAnswer: questions[currentQuestionIndex].answerIndex
    });
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect =
      answers[currentQuestionIndex] === currentQuestion.answerIndex;

    const newValidation = [...answerValidation];
    newValidation[currentQuestionIndex] = isCorrect;
    setAnswerValidation(newValidation);

    const newHasChecked = [...hasCheckedAnswer];
    newHasChecked[currentQuestionIndex] = true;
    setHasCheckedAnswer(newHasChecked);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleTimeExpired = () => {
    setIsTimerActive(false);
    handleSubmitExam();
  };

  const handleQuestionTimeExpired = () => {
    // Auto-advance to next question when time expires
    handleNextQuestion();
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;

    logger.info('ExamScreen', 'Exam submission initiated', {
      examSlug: exam!.slug,
      answeredQuestions: answers.filter(answer => answer !== -1).length,
      totalQuestions: questions.length
    });

    // Check if all questions are answered
    const unansweredCount = answers.filter((answer) => answer === -1).length;

    // Don't allow submission if no questions are answered at all
    const answeredCount = answers.filter((answer) => answer !== -1).length;
    if (answeredCount === 0) {
      logger.warn('ExamScreen', 'Submission blocked - no answers provided');
      Alert.alert(
        'No Answers Selected',
        'Please answer at least one question before submitting the exam.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (unansweredCount > 0) {
      logger.warn('ExamScreen', 'Submission with unanswered questions', { unansweredCount });
      Alert.alert(
        'Unanswered Questions',
        `You still have ${unansweredCount} unanswered questions. Are you sure you want to submit the exam?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: submitExam },
        ]
      );
      return;
    }

    submitExam();
  };

  const submitExam = async () => {
    setIsSubmitting(true);
    logger.info('ExamScreen', 'Submitting exam answers', { examSlug: exam!.slug });

    try {
      // Calculate time spent (for now, use exam duration as fallback)
      const timeSpent = 30; // Mock time spent in minutes
      const response = await submitExamResults(
        exam!.slug,
        {
          answers: answers,
          timeSpent: timeSpent
        },
        user?.token || 'mock-token'
      );

      if (response.success) {
        logger.info('ExamScreen', 'Exam submitted successfully', {
          examSlug: exam!.slug,
          score: response.result.score,
          passed: response.result.passed
        });
        
        // Track exam completion in progress service
        updateStats('exam_completed', {
          score: response.result.score,
          passed: response.result.passed,
          timeSpent: response.result.timeSpent || timeSpent,
          examSlug: exam!.slug,
          examTitle: exam!.title
        });
        
        // Track exam completion activity
        const activityType = response.result.passed ? ACTIVITY_TYPES.EXAM_PASSED : ACTIVITY_TYPES.EXAM_FAILED;
        activityService.addActivity(ACTIVITY_TYPES.EXAM_COMPLETED, {
          examId: exam!.id,
          examSlug: exam!.slug,
          examTitle: exam!.title,
          score: response.result.score,
          passed: response.result.passed,
          timeSpent: response.result.timeSpent || timeSpent,
          category: exam!.category?.name,
          userId: user?.id
        });
        
        // Also track pass/fail specific activity
        activityService.addActivity(activityType, {
          examId: exam!.id,
          examSlug: exam!.slug,
          examTitle: exam!.title,
          score: response.result.score,
          timeSpent: response.result.timeSpent || timeSpent,
          category: exam!.category?.name,
          userId: user?.id
        });
        
        router.replace(
          `/exam/result/${exam!.slug}?resultData=${encodeURIComponent(
            JSON.stringify(response.result)
          )}`
        );
      }
    } catch (error) {
      logger.error('ExamScreen', 'Failed to submit exam', error);
      Alert.alert('Error', 'Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Preparing exam...</Text>
      </View>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Exam not found</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <ExamHeader
        examTitle={exam.title}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        timerMode="total"
        totalDuration={30 * 60} // 30 minutes default
        onTimeExpired={handleTimeExpired}
        onQuestionTimeExpired={handleQuestionTimeExpired}
        isTimerActive={isTimerActive}
        onExit={handleExitExam}
      />

      <ExamProgress
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        onQuestionSelect={handleQuestionSelect}
        onToggleQuestionSidebar={() =>
          setShowQuestionSidebar(!showQuestionSidebar)
        }
      />

      <QuestionSidebar
        visible={showQuestionSidebar}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        onQuestionSelect={handleQuestionSelect}
        onClose={() => setShowQuestionSidebar(false)}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <QuestionDisplay
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
        />

        <AnswerOptions
          question={currentQuestion}
          selectedAnswer={answers[currentQuestionIndex]}
          onAnswerSelect={handleAnswerSelect}
          hasValidation={hasCheckedAnswer[currentQuestionIndex]}
          isCorrect={answerValidation[currentQuestionIndex]}
          isOpenExam={exam?.settings?.type === 'open'}
        />

        {/* Explanation for Open Exams */}
        {hasCheckedAnswer[currentQuestionIndex] && 
          currentQuestion.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>
            </View>
          )}
      </ScrollView>

      <ExamNavigation
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        selectedAnswer={answers[currentQuestionIndex]}
        hasCheckedAnswer={hasCheckedAnswer[currentQuestionIndex]}
        isOpenExam={true} // Always allow checking answers in this implementation
        isSubmitting={isSubmitting}
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
        onCheckAnswer={handleCheckAnswer}
        onSubmit={handleSubmitExam}
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  explanationContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});
