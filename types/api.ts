// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  subscription: 'free' | 'premium';
  avatar?: string;
}

export interface UserStats {
  totalExams: number;
  averageScore: number;
  passedExams: number;
  totalStudyTime: number;
  bookmarkedNotes: number;
  recentActivity: Activity[];
  streak: number;
  lastActivity: string | null;
}

export interface Activity {
  id: string;
  type: 'exam_completed' | 'note_viewed' | 'note_bookmarked';
  timestamp: string;
  examId?: string;
  examTitle?: string;
  noteId?: string;
  noteTitle?: string;
  score?: number;
  passed?: boolean;
}

// Notes Types
export interface Note {
  id: string;
  title: string;
  content: string;
  preview: string;
  category: string;
  dateCreated: string;
  dateModified: string;
  readTime: number;
  isBookmarked: boolean;
  isPremium: boolean;
  tags: string[];
}

// Exam Types
export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: number;
  duration: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isPremium: boolean;
  category: string;
  passingScore: number;
  settings: ExamSettings;
  questionIds: string[];
  isAccessible?: boolean;
}

export interface ExamSettings {
  type: 'open' | 'closed';
  immediateValidation: boolean;
  showCorrectAnswer: boolean;
  allowReview: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  image?: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
  passingScore: number;
  results: QuestionResult[];
  completedAt: string;
  timestamp: string;
}

export interface QuestionResult {
  questionId: string;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Contact Types
export interface ContactRequest {
  email: string;
  subject: string;
  message: string;
}

export interface AboutData {
  title: string;
  content: string;
  version: string;
  lastUpdated: string;
}
