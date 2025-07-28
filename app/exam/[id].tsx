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
import api from '@/services/api';
import { Exam, Question, ExamResult } from '@/types/api';

// Import components
import { ExamHeader } from '@/components/exam/ExamHeader';
import { ExamProgress } from '@/components/exam/ExamProgress';
import { QuestionDisplay } from '@/components/exam/QuestionDisplay';
import { AnswerOptions } from '@/components/exam/AnswerOptions';
import { ExamNavigation } from '@/components/exam/ExamNavigation';
import { QuestionSidebar } from '@/components/exam/QuestionSidebar';

export default function ExamScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [answerValidation, setAnswerValidation] = useState<boolean[]>([]);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionSidebar, setShowQuestionSidebar] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const handleExitExam = () => {
    Alert.alert(
      'Exit Exam',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  useEffect(() => {
    fetchExamData();
  }, [id]);

  const fetchExamData = async () => {
    setIsLoading(true);
    try {
      const response = await api.exams.fetchExamQuestions(id as string);
      if (response.success) {
        setExam(response.data!.exam);
        setQuestions(response.data!.questions);
        setAnswers(new Array(response.data!.questions.length).fill(-1));
        setAnswerValidation(
          new Array(response.data!.questions.length).fill(false)
        );
        setHasCheckedAnswer(
          new Array(response.data!.questions.length).fill(false)
        );
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
      Alert.alert('Error', 'Failed to load exam. Please try again.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
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
      Alert.alert('No Answer Selected', 'Please select an answer first.');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect =
      answers[currentQuestionIndex] === currentQuestion.correctAnswer;

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

    // Check if all questions are answered
    const unansweredCount = answers.filter((answer) => answer === -1).length;

    // Don't allow submission if no questions are answered at all
    const answeredCount = answers.filter((answer) => answer !== -1).length;
    if (answeredCount === 0) {
      Alert.alert(
        'No Answers Selected',
        'Please answer at least one question before submitting the exam.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (unansweredCount > 0) {
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

    try {
      // Calculate time spent (for now, use exam duration as fallback)
      const timeSpent = exam!.duration;
      const response = await api.exams.submitExamResult(
        exam!.id,
        answers,
        Math.floor(timeSpent / 60)
      );

      if (response.success) {
        router.replace(
          `/exam/result/${exam!.id}?resultData=${encodeURIComponent(
            JSON.stringify(response.data!)
          )}`
        );
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
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
        totalDuration={exam.duration * 60}
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
        {exam?.settings?.type === 'open' &&
          hasCheckedAnswer[currentQuestionIndex] && (
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
        isOpenExam={exam?.settings?.type === 'open'}
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
