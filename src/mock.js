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