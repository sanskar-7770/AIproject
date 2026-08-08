// src/mock.js

export const COURSE_DATA = {
  foundation: {
    id: "foundation",
    name: "CA Foundation",
    shortName: "CA Foundation",
    subjects: [
      {
        id: "f-accounting",
        name: "Accounting",
        code: "ACC101",
        color: "#38bdf8",
        targetHoursWeekly: 12,
      },
      {
        id: "f-law",
        name: "Business Laws",
        code: "LAW101",
        color: "#a855f7",
        targetHoursWeekly: 10,
      },
      {
        id: "f-quant",
        name: "Quantitative Aptitude",
        code: "QA101",
        color: "#10b981",
        targetHoursWeekly: 10,
      },
      {
        id: "f-economics",
        name: "Business Economics",
        code: "ECO101",
        color: "#f59e0b",
        targetHoursWeekly: 8,
      },
    ],
  },

  intermediate: {
    id: "intermediate",
    name: "CA Intermediate",
    shortName: "CA Inter",
    subjects: [
      {
        id: "i-accounting",
        name: "Advanced Accounting",
        code: "ACC201",
        color: "#38bdf8",
        targetHoursWeekly: 20,
      },
      {
        id: "i-law",
        name: "Corporate & Business Law",
        code: "LAW302",
        color: "#a855f7",
        targetHoursWeekly: 15,
      },
      {
        id: "i-tax",
        name: "Taxation",
        code: "TAX401",
        color: "#ec4899",
        targetHoursWeekly: 18,
      },
      {
        id: "i-cost",
        name: "Cost & Management Accounting",
        code: "CMA105",
        color: "#10b981",
        targetHoursWeekly: 15,
      },
      {
        id: "i-audit",
        name: "Auditing & Ethics",
        code: "AUD202",
        color: "#f59e0b",
        targetHoursWeekly: 12,
      },
      {
        id: "i-fm",
        name: "Financial Management & SM",
        code: "FSM303",
        color: "#6366f1",
        targetHoursWeekly: 15,
      },
    ],
  },

  final: {
    id: "final",
    name: "CA Final",
    shortName: "CA Final",
    subjects: [
      {
        id: "final-fr",
        name: "Financial Reporting",
        code: "FR501",
        color: "#38bdf8",
        targetHoursWeekly: 18,
      },
      {
        id: "final-afm",
        name: "Advanced Financial Management",
        code: "AFM501",
        color: "#a855f7",
        targetHoursWeekly: 15,
      },
      {
        id: "final-audit",
        name: "Advanced Auditing",
        code: "AUD501",
        color: "#f59e0b",
        targetHoursWeekly: 15,
      },
      {
        id: "final-tax",
        name: "Direct & Indirect Tax",
        code: "TAX501",
        color: "#ec4899",
        targetHoursWeekly: 18,
      },
    ],
  },

  school: {
    id: "school",
    name: "School & Board Exams",
    shortName: "School",
    subjects: [
      { id: "school-maths", name: "Mathematics", code: "MATH", color: "#38bdf8", targetHoursWeekly: 8 },
      { id: "school-science", name: "Science", code: "SCI", color: "#10b981", targetHoursWeekly: 8 },
      { id: "school-english", name: "English", code: "ENG", color: "#a855f7", targetHoursWeekly: 6 },
      { id: "school-social", name: "Social Science", code: "SST", color: "#f59e0b", targetHoursWeekly: 6 },
    ],
  },

  college: {
    id: "college",
    name: "College & University",
    shortName: "College",
    subjects: [
      { id: "college-core", name: "Core Subject", code: "CORE", color: "#38bdf8", targetHoursWeekly: 8 },
      { id: "college-major", name: "Major Paper", code: "MAJOR", color: "#a855f7", targetHoursWeekly: 8 },
      { id: "college-elective", name: "Elective", code: "ELEC", color: "#10b981", targetHoursWeekly: 5 },
      { id: "college-project", name: "Projects & Assignments", code: "PROJ", color: "#f59e0b", targetHoursWeekly: 5 },
    ],
  },

  competitive: {
    id: "competitive",
    name: "Competitive Exams",
    shortName: "Competitive",
    subjects: [
      { id: "comp-quant", name: "Quantitative Aptitude", code: "QUANT", color: "#38bdf8", targetHoursWeekly: 8 },
      { id: "comp-reasoning", name: "Logical Reasoning", code: "REAS", color: "#a855f7", targetHoursWeekly: 7 },
      { id: "comp-verbal", name: "Verbal Ability", code: "VERB", color: "#10b981", targetHoursWeekly: 6 },
      { id: "comp-general", name: "General Awareness", code: "GA", color: "#f59e0b", targetHoursWeekly: 6 },
    ],
  },

  government: {
    id: "government",
    name: "Government Exams",
    shortName: "Govt. Exams",
    subjects: [
      { id: "govt-aptitude", name: "Aptitude", code: "APT", color: "#38bdf8", targetHoursWeekly: 8 },
      { id: "govt-reasoning", name: "Reasoning", code: "REAS", color: "#a855f7", targetHoursWeekly: 7 },
      { id: "govt-gk", name: "General Knowledge", code: "GK", color: "#f59e0b", targetHoursWeekly: 7 },
      { id: "govt-language", name: "Language", code: "LANG", color: "#10b981", targetHoursWeekly: 5 },
    ],
  },

  certification: {
    id: "certification",
    name: "Professional Certification",
    shortName: "Certification",
    subjects: [
      { id: "cert-concepts", name: "Core Concepts", code: "CORE", color: "#38bdf8", targetHoursWeekly: 8 },
      { id: "cert-practice", name: "Practice & Labs", code: "LAB", color: "#10b981", targetHoursWeekly: 7 },
      { id: "cert-revision", name: "Revision", code: "REV", color: "#a855f7", targetHoursWeekly: 5 },
      { id: "cert-mocks", name: "Mock Tests", code: "MOCK", color: "#f59e0b", targetHoursWeekly: 4 },
    ],
  },

  selfStudy: {
    id: "selfStudy",
    name: "Self Study & Other Goals",
    shortName: "Self Study",
    subjects: [
      { id: "self-learning", name: "Primary Learning", code: "LEARN", color: "#38bdf8", targetHoursWeekly: 8 },
      { id: "self-practice", name: "Practice", code: "PRAC", color: "#10b981", targetHoursWeekly: 7 },
      { id: "self-revision", name: "Review & Revision", code: "REV", color: "#a855f7", targetHoursWeekly: 5 },
    ],
  },
};

export const getCourse = (courseId) =>
  COURSE_DATA[courseId] || COURSE_DATA.intermediate;

export const motivationalQuotes = [
  {
    quote:
      "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    quote:
      "The expert in anything was once a beginner. Keep logging those hours!",
    author: "Helen Hayes",
  },
  {
    quote:
      "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
  },
  {
    quote:
      "Small progress every day adds up to extraordinary results.",
    author: "Anonymous",
  },
];

export const initialTargets = [
  {
    id: "target-1",
    text: "Complete today's planned study",
    completed: false,
    priority: "High",
  },
];

export const initialExams = [];
