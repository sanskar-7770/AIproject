// Mock data for ApexStudy Universal Study & Exam Tracker
// Endpoint replacement: GET /api/study-data

export const initialSubjects = [
  { id: "subj-1", name: "Advanced Accounting", code: "ACC201", color: "#38bdf8", targetHoursWeekly: 20 },
  { id: "subj-2", name: "Corporate & Business Law", code: "LAW302", color: "#a855f7", targetHoursWeekly: 15 },
  { id: "subj-3", name: "Taxation & Direct/Indirect", code: "TAX401", color: "#ec4899", targetHoursWeekly: 18 },
  { id: "subj-4", name: "Cost & Management Accounting", code: "CMA105", color: "#10b981", targetHoursWeekly: 15 },
  { id: "subj-5", name: "Auditing & Ethics", code: "AUD202", color: "#f59e0b", targetHoursWeekly: 12 },
  { id: "subj-6", name: "Financial Management & SM", code: "FSM303", color: "#6366f1", targetHoursWeekly: 15 }
];

export const initialExams = [
  {
    id: "exam-1",
    title: "Professional Intermediate Group 1",
    examDate: "2026-09-15T09:00:00Z",
    location: "Main Exam Center / Online",
    notes: "Focus heavily on practical problems and tax amendments.",
    color: "#38bdf8",
    active: true
  },
  {
    id: "exam-2",
    title: "Professional Intermediate Group 2",
    examDate: "2026-09-22T09:00:00Z",
    location: "Main Exam Center / Online",
    notes: "Review audit standards and strategic case studies.",
    color: "#a855f7",
    active: false
  },
  {
    id: "exam-3",
    title: "Mock Test Series Final Round",
    examDate: "2026-08-10T10:00:00Z",
    location: "Online Portal",
    notes: "Attempt full 3-hour papers under exam conditions.",
    color: "#10b981",
    active: false
  }
];

export const initialStudyLogs = [
  { id: "log-1", date: "2026-07-20", subjectId: "subj-1", hours: 4.5, type: "Deep Work", notes: "Consolidated partnership accounts and amalgamation sums." },
  { id: "log-2", date: "2026-07-20", subjectId: "subj-3", hours: 3.0, type: "Practice", notes: "Solved 15 numerical problems on capital gains tax." },
  { id: "log-3", date: "2026-07-19", subjectId: "subj-2", hours: 5.0, type: "Revision", notes: "Companies Act sections 1 to 72 memorized & summarized." },
  { id: "log-4", date: "2026-07-19", subjectId: "subj-4", hours: 2.5, type: "Problem Solving", notes: "Standard costing variances and overhead allocation." },
  { id: "log-5", date: "2026-07-18", subjectId: "subj-5", hours: 4.0, type: "Reading", notes: "SA 200 series and professional ethics case study." },
  { id: "log-6", date: "2026-07-17", subjectId: "subj-6", hours: 3.5, type: "Lecture", notes: "Capital budgeting NPV and IRR analysis." }
];

export const initialTargets = [
  { id: "target-1", text: "Complete Tax Chapter 4 practice sums", subjectId: "subj-3", completed: true, priority: "High", date: "2026-07-20" },
  { id: "target-2", text: "Revise Audit SA 240 & SA 300 notes", subjectId: "subj-5", completed: false, priority: "Medium", date: "2026-07-20" },
  { id: "target-3", text: "Solve 2 past exam papers in Costing", subjectId: "subj-4", completed: false, priority: "High", date: "2026-07-20" },
  { id: "target-4", text: "Draft summary notes for Company Law Directors", subjectId: "subj-2", completed: true, priority: "Low", date: "2026-07-20" }
];

export const initialPomodoroPresets = [
  { id: "pom-1", label: "Deep Focus Session", duration: 50, breakTime: 10, type: "work" },
  { id: "pom-2", label: "Standard Pomodoro", duration: 25, breakTime: 5, type: "work" },
  { id: "pom-3", label: "Quick Revision Sprint", duration: 15, breakTime: 3, type: "work" }
];

export const motivationalQuotes = [
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { quote: "The expert in anything was once a beginner. Keep logging those hours!", author: "Helen Hayes" },
  { quote: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" }
];
