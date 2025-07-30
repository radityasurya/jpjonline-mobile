import {
  ApiResponse,
  User,
  Note,
  Exam,
  Question,
  ExamResult,
  LoginRequest,
  RegisterRequest,
  ContactRequest,
  AboutData,
  UserStats,
  Activity,
} from '@/types/api';

// Import mock data
import notesData from '@/data/notes.json';
import examsData from '@/data/exams.json';
import questionsData from '@/data/questions.json';
import usersData from '@/data/users.json';
import {
  activityStorage,
  examStorage,
  bookmarkStorage,
  statsCalculator,
} from '@/utils/storage';

// Utility function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Utility function to simulate random failures (5% chance)
const shouldFail = () => Math.random() < 0.05;

// Notes API
export const notesAPI = {
  async fetchCategories(): Promise<ApiResponse<string[]>> {
    await delay(500);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch categories' };
    }

    return {
      success: true,
      data: notesData.categories,
    };
  },

  async fetchNotes(
    category?: string,
    search?: string,
  ): Promise<ApiResponse<Note[]>> {
    await delay(1000);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch notes' };
    }

    let filteredNotes = [...notesData.notes];

    // Apply category filter
    if (category && category !== 'All') {
      filteredNotes = filteredNotes.filter(
        (note) => note.category === category,
      );
    }

    // Apply search filter
    if (search) {
      const query = search.toLowerCase();
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    return {
      success: true,
      data: filteredNotes,
    };
  },

  async fetchNoteById(id: string): Promise<ApiResponse<Note>> {
    await delay(500);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch note' };
    }

    const note = notesData.notes.find((note) => note.id === id);

    if (!note) {
      return { success: false, error: 'Note not found' };
    }

    return {
      success: true,
      data: note,
    };
  },

  async toggleBookmark(noteId: string): Promise<ApiResponse<boolean>> {
    await delay(200);

    if (shouldFail()) {
      return { success: false, error: 'Failed to toggle bookmark' };
    }

    try {
      const isCurrentlyBookmarked = await bookmarkStorage.isBookmarked(noteId);

      if (isCurrentlyBookmarked) {
        await bookmarkStorage.removeBookmark(noteId);
      } else {
        await bookmarkStorage.addBookmark(noteId);
      }

      return {
        success: true,
        data: !isCurrentlyBookmarked,
      };
    } catch (error) {
      return { success: false, error: 'Failed to toggle bookmark' };
    }
  },

  async getBookmarkedNotes(): Promise<ApiResponse<Note[]>> {
    await delay(300);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch bookmarked notes' };
    }

    try {
      const bookmarkedIds = await bookmarkStorage.getBookmarks();
      const bookmarkedNotes = notesData.notes.filter((note) =>
        bookmarkedIds.includes(note.id),
      );

      return {
        success: true,
        data: bookmarkedNotes,
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch bookmarked notes' };
    }
  },
};

// Exams API
export const examsAPI = {
  async fetchCategories(): Promise<ApiResponse<string[]>> {
    await delay(500);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch exam categories' };
    }

    return {
      success: true,
      data: examsData.categories,
    };
  },

  async fetchExams(
    userSubscription: 'free' | 'premium' = 'free',
  ): Promise<ApiResponse<Exam[]>> {
    await delay(1000);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch exams' };
    }

    const examsWithAccess = examsData.exams.map((exam) => ({
      ...exam,
      isAccessible: userSubscription === 'premium' || !exam.isPremium,
    }));

    return {
      success: true,
      data: examsWithAccess,
    };
  },

  async fetchExamById(examId: string): Promise<ApiResponse<Exam>> {
    await delay(500);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch exam' };
    }

    const exam = examsData.exams.find((exam) => exam.id === examId);

    if (!exam) {
      return { success: false, error: 'Exam not found' };
    }

    return {
      success: true,
      data: exam,
    };
  },

  async fetchExamQuestions(
    examId: string,
  ): Promise<ApiResponse<{ exam: Exam; questions: Question[] }>> {
    await delay(800);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch exam questions' };
    }

    const exam = examsData.exams.find((exam) => exam.id === examId);

    if (!exam) {
      return { success: false, error: 'Exam not found' };
    }

    const questions = exam.questionIds
      .map((qId) => (questionsData as any)[qId])
      .filter(Boolean);

    return {
      success: true,
      data: { exam, questions },
    };
  },

  async submitExamResult(
    examId: string,
    answers: number[],
    timeSpent: number,
  ): Promise<ApiResponse<ExamResult>> {
    await delay(1000);

    if (shouldFail()) {
      return { success: false, error: 'Failed to submit exam result' };
    }

    const exam = examsData.exams.find((exam) => exam.id === examId);

    if (!exam) {
      return { success: false, error: 'Exam not found' };
    }

    const questions = exam.questionIds
      .map((qId) => (questionsData as any)[qId])
      .filter(Boolean);

    let correctAnswers = 0;
    const results = questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: question.id,
        question: question.question,
        userAnswer: answers[index] ?? -1,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= exam.passingScore;

    const result: ExamResult = {
      id: Date.now().toString(),
      examId,
      examTitle: exam.title,
      score,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent,
      passed,
      passingScore: exam.passingScore,
      results,
      completedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage
    try {
      await examStorage.saveResult(result);
    } catch (error) {
      console.error('Failed to save result to localStorage:', error);
    }

    return {
      success: true,
      data: result,
    };
  },

  async getExamResults(): Promise<ApiResponse<ExamResult[]>> {
    await delay(300);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch exam results' };
    }

    try {
      const results = await examStorage.getResults();
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch exam results' };
    }
  },
};

// Auth API
export const authAPI = {
  async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
    await delay(1000);

    if (shouldFail()) {
      return { success: false, error: 'Login service temporarily unavailable' };
    }

    const user = usersData.demoUsers.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password,
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      data: userWithoutPassword as User,
    };
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    await delay(1000);

    if (shouldFail()) {
      return {
        success: false,
        error: 'Registration service temporarily unavailable',
      };
    }

    // Check if email already exists
    const existingUser = usersData.demoUsers.find(
      (u) => u.email === userData.email,
    );

    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      subscription: 'free',
    };

    return {
      success: true,
      data: newUser,
    };
  },

  async forgotPassword(email: string): Promise<ApiResponse<string>> {
    await delay(2000);

    if (shouldFail()) {
      return {
        success: false,
        error: 'Password reset service temporarily unavailable',
      };
    }

    return {
      success: true,
      data: 'Password reset link sent to your email',
      message:
        'If an account with this email exists, you will receive a password reset link shortly.',
    };
  },
};

// User API
export const userAPI = {
  async fetchUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    await delay(300);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch user statistics' };
    }

    try {
      const stats = await statsCalculator.calculateStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return { success: false, error: 'Failed to calculate user statistics' };
    }
  },

  async getRecentActivity(): Promise<ApiResponse<Activity[]>> {
    await delay(200);

    if (shouldFail()) {
      return { success: false, error: 'Failed to fetch recent activity' };
    }

    try {
      const activities = await activityStorage.getHistory();
      return {
        success: true,
        data: activities.slice(0, 5), // Return last 5 activities
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch recent activity' };
    }
  },

  async updateProfile(
    userId: string,
    profileData: Partial<User>,
  ): Promise<ApiResponse<User>> {
    await delay(1000);

    if (shouldFail()) {
      return { success: false, error: 'Failed to update profile' };
    }

    // Mock updated user data
    const updatedUser: User = {
      id: userId,
      name: profileData.name || 'Updated User',
      email: profileData.email || 'user@example.com',
      subscription: 'free',
    };

    return {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    };
  },
};

// Contact API
export const contactAPI = {
  async submitContactForm(
    formData: ContactRequest,
  ): Promise<ApiResponse<string>> {
    await delay(2000);

    if (shouldFail()) {
      return {
        success: false,
        error: 'Failed to send message. Please try again.',
      };
    }

    const ticketId = `JPJ-${Date.now()}`;

    return {
      success: true,
      data: ticketId,
      message:
        'Thank you for your message! We will get back to you within 24 hours.',
    };
  },

  async fetchAboutData(): Promise<ApiResponse<AboutData>> {
    await delay(1000);

    if (shouldFail()) {
      return { success: false, error: 'Failed to load about information' };
    }

    return {
      success: true,
      data: usersData.aboutData,
    };
  },
};

// Storage API (for local data management)
export const storageAPI = {
  async toggleBookmark(noteId: string): Promise<ApiResponse<boolean>> {
    await delay(200);

    try {
      const isCurrentlyBookmarked = await bookmarkStorage.isBookmarked(noteId);

      if (isCurrentlyBookmarked) {
        await bookmarkStorage.removeBookmark(noteId);
      } else {
        await bookmarkStorage.addBookmark(noteId);
      }

      return {
        success: true,
        data: !isCurrentlyBookmarked,
      };
    } catch (error) {
      return { success: false, error: 'Failed to toggle bookmark' };
    }
  },

  async getBookmarks(): Promise<ApiResponse<string[]>> {
    await delay(200);

    try {
      const bookmarks = await bookmarkStorage.getBookmarks();
      return {
        success: true,
        data: bookmarks,
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch bookmarks' };
    }
  },

  async saveActivity(
    activity: Omit<Activity, 'id' | 'timestamp'>,
  ): Promise<ApiResponse<Activity>> {
    await delay(100);

    try {
      const savedActivity = await activityStorage.addActivity(activity);
      return {
        success: true,
        data: savedActivity,
      };
    } catch (error) {
      return { success: false, error: 'Failed to save activity' };
    }
  },
};

// Add saveActivity to userAPI as well
userAPI.saveActivity = storageAPI.saveActivity;
// Export all APIs
export default {
  notes: notesAPI,
  exams: examsAPI,
  auth: authAPI,
  user: userAPI,
  contact: contactAPI,
  storage: storageAPI,
};
