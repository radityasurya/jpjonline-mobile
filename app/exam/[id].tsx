import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';
import soundManager from '@/utils/soundManager';
import { decodeHtmlEntities } from '@/utils/htmlDecoder';
import { LAYOUT_CONSTANTS } from '@/constants/layout';
import {
  getExamBySlug,
  progressService,
  activityService,
  ACTIVITY_TYPES,
} from '@/services';
import { saveExamResult } from '@/services/examsService.js';

// Import components
import { ExamHeader } from '@/components/exam/ExamHeader';
import { ExamProgress } from '@/components/exam/ExamProgress';
import { QuestionDisplay } from '@/components/exam/QuestionDisplay';
import { AnswerOptions } from '@/components/exam/AnswerOptions';
import { ExamNavigation } from '@/components/exam/ExamNavigation';
import { QuestionSidebar } from '@/components/exam/QuestionSidebar';

// Types for the new API structure
interface ApiQuestion {
  id: string;
  text: string;
  options: string[];
  answerIndex: number;
  explanation: string | null;
  imageUrl: string | null;
  optionImages?: string[];
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
  totalTimeDuration: number;
  timerType: string;
  mode: 'OPEN' | 'CLOSED';
  questions: ApiQuestion[];
}

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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showQuestionSidebar, setShowQuestionSidebar] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [examMode, setExamMode] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [questionRetryStates, setQuestionRetryStates] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState<Date>(new Date());

  const handleExitExam = () => {
    logger.userAction('Exam exit requested');

    // On web/desktop, exit directly without modal
    if (Platform.OS === 'web') {
      logger.userAction('Exam exited', { examSlug });
      router.replace('/(tabs)/tests');
      return;
    }

    // On mobile, show confirmation modal
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
            router.replace('/(tabs)/tests');
          },
        },
      ],
    );
  };

  useEffect(() => {
    // Check if user is logged in before fetching exam
    if (!user) {
      logger.warn('ExamScreen', 'User not logged in, redirecting to login');
      router.replace('/auth/login');
      return;
    }

    fetchExamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examSlug, user]);

  const fetchExamData = async () => {
    setIsLoading(true);
    logger.info('ExamScreen', 'Loading exam data', { examSlug });
    try {
      const examData = (await getExamBySlug(examSlug as string, '')) as ApiExam;
      logger.info('ExamScreen', 'Exam data loaded successfully', {
        examSlug,
        questionsCount: examData.questions.length,
        examTitle: examData.title,
      });
      setExam(examData);
      setQuestions(examData.questions);

      // Set exam mode based on exam settings from API or default to OPEN
      const mode = examData.mode === 'CLOSED' ? 'CLOSED' : 'OPEN';
      setExamMode(mode);

      // Set start time for duration calculation
      setStartTime(new Date());

      setAnswers(new Array(examData.questions.length).fill(-1));
      setAnswerValidation(new Array(examData.questions.length).fill(false));
      setHasCheckedAnswer(new Array(examData.questions.length).fill(false));
      setQuestionRetryStates(new Array(examData.questions.length).fill(false));

      // Track exam start activity
      activityService.addActivity(ACTIVITY_TYPES.EXAM_STARTED, {
        examId: examData.id,
        examSlug: examData.slug,
        examTitle: examData.title,
        category: examData.category?.name,
        userId: user?.id,
      });
    } catch (error: any) {
      logger.error('ExamScreen', 'Failed to load exam data', error);

      // Check if it's an authentication error
      const errorMessage = error?.message || '';
      if (
        errorMessage.includes('Session expired') ||
        errorMessage.includes('Authentication required') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('401')
      ) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/auth/login');
              },
            },
          ],
          { cancelable: false },
        );
      } else {
        Alert.alert('Error', 'Failed to load exam. Please try again.');
        router.back();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    // In both modes, allow reselection until moving to next question
    // CLOSED mode: can reselect until clicking Next
    // OPEN mode: can reselect until checking answer

    // In OPEN mode, if answer was checked, reset validation state for retry
    if (examMode === 'OPEN' && hasCheckedAnswer[currentQuestionIndex]) {
      // Reset validation state for retry
      const newHasChecked = [...hasCheckedAnswer];
      newHasChecked[currentQuestionIndex] = false;
      setHasCheckedAnswer(newHasChecked);

      const newRetryStates = [...questionRetryStates];
      newRetryStates[currentQuestionIndex] = true;
      setQuestionRetryStates(newRetryStates);
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleCheckAnswer = useCallback(() => {
    if (answers[currentQuestionIndex] === -1) {
      logger.warn('ExamScreen', 'Check answer attempted with no selection');
      Alert.alert('No Answer Selected', 'Please select an answer first.');
      return;
    }

    logger.userAction('Answer checked', {
      questionIndex: currentQuestionIndex,
      selectedAnswer: answers[currentQuestionIndex],
      correctAnswer: questions[currentQuestionIndex].answerIndex,
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

    // Play sound feedback
    if (examMode === 'OPEN' && isSoundEnabled && isCorrect) {
      soundManager.playCorrect();
    } else if (examMode === 'OPEN' && isSoundEnabled) {
      soundManager.playIncorrect();
    }
  }, [
    answers,
    currentQuestionIndex,
    questions,
    answerValidation,
    hasCheckedAnswer,
    examMode,
    isSoundEnabled,
  ]);

  const handleRetryQuestion = () => {
    logger.userAction('Question retry', {
      questionIndex: currentQuestionIndex,
    });

    // Reset answer and validation for current question
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = -1;
    setAnswers(newAnswers);

    const newHasChecked = [...hasCheckedAnswer];
    newHasChecked[currentQuestionIndex] = false;
    setHasCheckedAnswer(newHasChecked);

    const newValidation = [...answerValidation];
    newValidation[currentQuestionIndex] = false;
    setAnswerValidation(newValidation);
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

  const handleTimeExpired = useCallback(() => {
    logger.warn('ExamScreen', 'Exam time expired, auto-submitting');
    setIsTimerActive(false);

    Alert.alert(
      'Time Expired',
      'Your exam time has expired. The exam will be submitted automatically.',
      [
        {
          text: 'Submit Now',
          onPress: () => {
            submitExam();
          },
        },
      ],
      { cancelable: false }, // Prevent dismissing the alert
    );
  }, []);

  const handleQuestionTimeExpired = useCallback(() => {
    logger.debug('ExamScreen', 'Question time expired');
    if (isSoundEnabled) {
      soundManager.playWarning();
    }

    if (examMode === 'OPEN') {
      // In OPEN mode, force check answer if selected, then move to next
      if (
        answers[currentQuestionIndex] !== -1 &&
        !hasCheckedAnswer[currentQuestionIndex]
      ) {
        handleCheckAnswer();
      }
    }

    // Auto-advance to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [
    examMode,
    answers,
    currentQuestionIndex,
    hasCheckedAnswer,
    isSoundEnabled,
    handleCheckAnswer,
  ]);

  const handleToggleSound = () => {
    const newSoundState = !isSoundEnabled;
    setIsSoundEnabled(newSoundState);
    soundManager.setEnabled(newSoundState);
    logger.userAction('Sound toggled', { enabled: newSoundState });
  };

  const handleToggleMode = () => {
    const newMode = examMode === 'OPEN' ? 'CLOSED' : 'OPEN';
    setExamMode(newMode);
    logger.userAction('Exam mode toggled', { mode: newMode });

    // Reset all validation states when switching modes
    setHasCheckedAnswer(new Array(questions.length).fill(false));
    setAnswerValidation(new Array(questions.length).fill(false));
    setQuestionRetryStates(new Array(questions.length).fill(false));
  };

  const handleSubmitExam = async () => {
    if (isSubmitting || hasSubmitted) return;

    logger.info('ExamScreen', 'Exam submission initiated', {
      examSlug: exam!.slug,
      answeredQuestions: answers.filter((answer) => answer !== -1).length,
      totalQuestions: questions.length,
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
        [{ text: 'OK' }],
      );
      return;
    }

    if (unansweredCount > 0) {
      logger.warn('ExamScreen', 'Submission with unanswered questions', {
        unansweredCount,
      });
      Alert.alert(
        'Unanswered Questions',
        `You still have ${unansweredCount} unanswered questions. Are you sure you want to submit the exam?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: submitExam },
        ],
      );
      return;
    }

    submitExam();
  };

  const submitExam = async () => {
    if (hasSubmitted) {
      logger.warn('ExamScreen', 'Exam already submitted, skipping');
      return;
    }

    setIsSubmitting(true);
    setHasSubmitted(true);

    // Calculate actual time spent
    const endTime = new Date();
    const timeSpentMinutes = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60),
    );

    logger.info('ExamScreen', 'Submitting exam answers', {
      examSlug: exam!.slug,
      answeredQuestions: answers.filter((answer) => answer !== -1).length,
      totalQuestions: questions.length,
    });

    try {
      // Calculate score client-side
      let correctAnswers = 0;
      const questionResults: {
        questionId: string;
        question: string;
        userAnswer: number;
        correctAnswer: number;
        isCorrect: boolean;
        explanation: string;
        questionImage: string | null;
        options: string[];
        optionImages: string[];
      }[] = [];

      questions.forEach((question, index) => {
        const userAnswer = answers[index] ?? -1;
        const correctAnswerIndex = question.answerIndex;
        const isCorrect = userAnswer === correctAnswerIndex;
        if (isCorrect) correctAnswers++;

        // Normalize options and optionImages
        let normalizedOptions: string[] = [];
        let normalizedOptionImages: string[] = [];

        if (Array.isArray(question.options)) {
          normalizedOptions = question.options;
          normalizedOptionImages =
            question.optionImages && Array.isArray(question.optionImages)
              ? question.optionImages
              : [];
        }

        questionResults.push({
          questionId: question.id,
          question: question.text,
          userAnswer: userAnswer,
          correctAnswer: correctAnswerIndex,
          isCorrect: isCorrect,
          explanation: question.explanation || '',
          questionImage: question.imageUrl || null,
          options: normalizedOptions,
          optionImages: normalizedOptionImages,
        });
      });

      const totalQuestions = questions.length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= 80; // Default passing score

      // Generate unique result ID using timestamp + random string to prevent duplicates
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const examResult = {
        id: `result_${uniqueId}`,
        examId: exam!.id,
        examSlug: exam!.slug,
        examTitle: exam!.title,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        timeSpent: timeSpentMinutes,
        passed: passed,
        passingScore: 80,
        results: questionResults,
        completedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };

      logger.info('ExamScreen', 'Exam results calculated', {
        examSlug: exam!.slug,
        score: examResult.score,
        passed: examResult.passed,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
      });

      // Save result directly to exam history (bypass submitExamResults to avoid duplicate calculation)
      try {
        await saveExamResult(examResult);

        logger.info('ExamScreen', 'Exam result saved to history successfully', {
          examSlug: exam!.slug,
          score: examResult.score,
        });
      } catch (saveError) {
        logger.error(
          'ExamScreen',
          'Failed to save exam result to history',
          saveError,
        );
        // Continue with navigation even if save fails
      }

      // Track exam completion in progress service
      const statsUpdateResult = await progressService.updateStats(
        'exam_completed',
        {
          score: examResult.score,
          passed: examResult.passed,
          timeSpent: examResult.timeSpent,
          examSlug: exam!.slug,
          examTitle: exam!.title,
        },
      );

      if (statsUpdateResult.success) {
        logger.info(
          'ExamScreen',
          'Stats updated successfully',
          statsUpdateResult,
        );
      } else {
        logger.error(
          'ExamScreen',
          'Failed to update stats',
          statsUpdateResult.error,
        );
      }

      // Track exam completion activity
      const activityType = examResult.passed
        ? ACTIVITY_TYPES.EXAM_PASSED
        : ACTIVITY_TYPES.EXAM_FAILED;
      activityService.addActivity(ACTIVITY_TYPES.EXAM_COMPLETED, {
        examId: exam!.id,
        examSlug: exam!.slug,
        examTitle: exam!.title,
        score: examResult.score,
        passed: examResult.passed,
        timeSpent: examResult.timeSpent,
        category: exam!.category?.name,
        userId: user?.id,
      });
      logger.info('ExamScreen', 'Exam completion activity tracked');

      // Also track pass/fail specific activity
      activityService.addActivity(activityType, {
        examId: exam!.id,
        examSlug: exam!.slug,
        examTitle: exam!.title,
        score: examResult.score,
        timeSpent: examResult.timeSpent,
        category: exam!.category?.name,
        userId: user?.id,
      });
      logger.info('ExamScreen', 'Pass/fail activity tracked');

      // Navigate to result page
      const resultJson = JSON.stringify(examResult);
      logger.info('ExamScreen', 'Navigating to results page', {
        examSlug: exam!.slug,
        resultDataSize: resultJson.length,
        resultDataPreview: resultJson.substring(0, 200) + '...',
      });

      try {
        const encodedResultData = encodeURIComponent(resultJson);
        logger.info('ExamScreen', 'Attempting navigation to results page', {
          encodedLength: encodedResultData.length,
          url: `/exam/result/${exam!.slug}?resultData=${encodedResultData}`,
        });

        // Use push to add to navigation stack
        router.push(
          `/exam/result/${exam!.slug}?resultData=${encodedResultData}`,
        );

        logger.info('ExamScreen', 'Navigation completed', {
          success: true,
        });
      } catch (error) {
        logger.error('ExamScreen', 'Failed to navigate to results page', error);
        Alert.alert(
          'Navigation Error',
          'Failed to navigate to results page. Please try again.',
        );
      }
    } catch (error: any) {
      logger.error('ExamScreen', 'Failed to submit exam', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      Alert.alert(
        'Submission Failed',
        `Failed to submit exam: ${errorMessage}\n\nPlease try again.`,
      );
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
        totalDuration={exam.totalTimeDuration || 30 * 60} // Use exam duration from API or 30 min default
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
        isSoundEnabled={isSoundEnabled}
        examMode={examMode}
        onToggleSound={handleToggleSound}
        onToggleMode={handleToggleMode}
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
          examMode={examMode}
          disabled={false}
        />

        {/* Explanation for Open Exams */}
        {examMode === 'OPEN' &&
          hasCheckedAnswer[currentQuestionIndex] &&
          currentQuestion.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>
                {decodeHtmlEntities(currentQuestion.explanation)}
              </Text>
            </View>
          )}
      </ScrollView>

      <ExamNavigation
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        selectedAnswer={answers[currentQuestionIndex]}
        hasCheckedAnswer={hasCheckedAnswer[currentQuestionIndex]}
        examMode={examMode}
        isSubmitting={isSubmitting}
        canRetryQuestion={
          examMode === 'OPEN' &&
          hasCheckedAnswer[currentQuestionIndex] &&
          !answerValidation[currentQuestionIndex]
        }
        onPrevious={handlePreviousQuestion}
        onNext={handleNextQuestion}
        onCheckAnswer={handleCheckAnswer}
        onRetryQuestion={handleRetryQuestion}
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
  examModeIndicator: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  examModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
});
