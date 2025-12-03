export type Language = 'en' | 'ms';

export interface TranslationKeys {
  nav: {
    notes: string;
    exams: string;
    directory: string;
    about: string;
    faq: string;
    privacyPolicy: string;
    contact: string;
    getPremium: string;
    signIn: string;
    signUp: string;
    menu: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      forgotPassword: string;
      signIn: string;
      dontHaveAccount: string;
      signUp: string;
      enterEmail: string;
      enterPassword: string;
      errors: {
        invalidCredentials: string;
      };
    };
    signup: {
      title: string;
      subtitle: string;
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
      createAccount: string;
      alreadyHaveAccount: string;
      signIn: string;
      errors: {
        passwordsDoNotMatch: string;
        passwordTooShort: string;
        signupFailed: string;
      };
    };
  };
  notes: {
    title: string;
    subtitle: string;
    allCategories: string;
    selectCategory: string;
    searchTopics: string;
    selectTopic: string;
    categoryNotFound: string;
    failedToLoad: string;
    backToTopics: string;
  };
  exams: {
    title: string;
    categories: {
      title: string;
      subtitle: string;
    };
    backToCategories: string;
    examNotFound: string;
    failedToLoad: string;
    exitExam: string;
    exitExamDescription: string;
    submitExam: string;
    submitExamDescription: string;
    question: string;
    timeRemaining: string;
    previous: string;
    next: string;
    submit: string;
    startExam: string;
    upgradeToPremium: string;
    questions: string;
    duration: string;
    unlimited: string;
    passScore: string;
  };
  directory: {
    title: string;
    subtitle: string;
    noListingsFound: string;
    businessName: string;
    category: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    state: string;
    city: string;
  };
  packages: {
    title: string;
    subtitle: string;
    freePlan: {
      title: string;
      description: string;
      getStarted: string;
    };
    premiumPlan: {
      title: string;
      description: string;
      mostPopular: string;
      unlockFeatures: string;
      alreadyPremium: string;
    };
  };
}
