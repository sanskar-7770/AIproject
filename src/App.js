import React, { useState, useEffect } from "react";
import { 
  Timer, Calendar as CalendarIcon, Target, BookOpen, Clock, 
  Award, Plus, Trash2, CheckCircle2, Circle, AlertCircle, 
  Settings, Play, Pause, RotateCcw, BarChart3, Flame, 
  ChevronRight, Sparkles, Check, Edit3, X, ArrowUpRight, ShieldCheck, RefreshCw
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { toast, Toaster } from "sonner";
import { 
  initialSubjects, initialExams, initialStudyLogs, 
  initialTargets, initialPomodoroPresets, motivationalQuotes 
} from "./mock";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Core Data States (persisted to localStorage or initialized from mock)
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem("apex_subjects");
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [exams, setExams] = useState(() => {
    const saved = localStorage.getItem("apex_exams");
    return saved ? JSON.parse(saved) : initialExams;
  });

  const [studyLogs, setStudyLogs] = useState(() => {
    const saved = localStorage.getItem("apex_logs");
    return saved ? JSON.parse(saved) : initialStudyLogs;
  });

  const [targets, setTargets] = useState(() => {
    const saved = localStorage.getItem("apex_targets");
    return saved ? JSON.parse(saved) : initialTargets;
  });

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("apex_subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("apex_exams", JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem("apex_logs", JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem("apex_targets", JSON.stringify(targets));
  }, [targets]);

  // Pomodoro Timer State
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState("work"); // work | break
  const [selectedPomoSubject, setSelectedPomoSubject] = useState(subjects[0]?.id || "");

  // Dialog / Modal States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // New Form Inputs
  const [newLog, setNewLog] = useState({ subjectId: subjects[0]?.id || "", hours: 2, type: "Deep Work", notes: "", date: new Date().toISOString().split("T")[0] });
  const [newTarget, setNewTarget] = useState({ text: "", subjectId: subjects[0]?.id || "", priority: "Medium", date: new Date().toISOString().split("T")[0] });
  const [newSubject, setNewSubject] = useState({ name: "", code: "", color: "#38bdf8", targetHoursWeekly: 15 });
  const [newExam, setNewExam] = useState({ title: "", examDate: "", location: "", notes: "", color: "#38bdf8" });

  // Quote of the day index
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Countdown calculations
  const primaryExam = exams.find(e => e.active) || exams[0];
  const calculateDaysLeft = (dateStr) => {
    if (!dateStr) return 0;
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = primaryExam ? calculateDaysLeft(primaryExam.examDate) : 0;

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval = null;
    if (pomoActive) {
      interval = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(pomoSeconds - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes(pomoMinutes - 1);
          setPomoSeconds(59);
        } else {
          // Timer completed!
          clearInterval(interval);
          setPomoActive(false);
          if (pomoMode === "work") {
            toast.success("Focus session completed! Great job!", { description: `Logged time for ${subjects.find(s=>s.id===selectedPomoSubject)?.name || 'Study'}` });
            // Automatically log study hours
            const logEntry = {
              id: "log-" + Date.now(),
              date: new Date().toISOString().split("T")[0],
              subjectId: selectedPomoSubject,
              hours: 0.5, // 30 mins or custom
              type: "Pomodoro Focus",
              notes: "Completed Pomodoro timer session"
            };
            setStudyLogs(prev => [logEntry, ...prev]);
            // Switch to break
            setPomoMode("break");
            setPomoMinutes(5);
            setPomoSeconds(0);
          } else {
            toast.info("Break finished! Ready for next session?");
            setPomoMode("work");
            setPomoMinutes(25);
            setPomoSeconds(0);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoMinutes, pomoSeconds, pomoMode, selectedPomoSubject, subjects]);

  const togglePomodoro = () => setPomoActive(!pomoActive);
  const resetPomodoro = (mins = 25, mode = "work") => {
    setPomoActive(false);
    setPomoMinutes(mins);
    setPomoSeconds(0);
    setPomoMode(mode);
  };

  // Handlers for data actions
  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newLog.subjectId || !newLog.hours) {
      toast.error("Please fill in subject and hours");
      return;
    }
    const entry = {
      id: "log-" + Date.now(),
      ...newLog,
      hours: parseFloat(newLog.hours)
    };
    setStudyLogs([entry, ...studyLogs]);
    setIsLogModalOpen(false);
    toast.success("Study hours logged successfully! 🎉");
    setNewLog({ subjectId: subjects[0]?.id || "", hours: 2, type: "Deep Work", notes: "", date: new Date().toISOString().split("T")[0] });
  };

  const handleAddTarget = (e) => {
    e.preventDefault();
    if (!newTarget.text.trim()) {
      toast.error("Please enter target description");
      return;
    }
    const item = {
      id: "target-" + Date.now(),
      ...newTarget,
      completed: false
    };
    setTargets([item, ...targets]);
    setIsTargetModalOpen(false);
    toast.success("New daily target added!");
    setNewTarget({ text: "", subjectId: subjects[0]?.id || "", priority: "Medium", date: new Date().toISOString().split("T")[0] });
  };

  const toggleTargetComplete = (id) => {
    setTargets(targets.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    toast.success("Target status updated");
  };

  const deleteTarget = (id) => {
    setTargets(targets.filter(t => t.id !== id));
    toast.info("Target removed");
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) {
      toast.error("Subject name is required");
      return;
    }
    const subj = {
      id: "subj-" + Date.now(),
      ...newSubject,
      targetHoursWeekly: parseInt(newSubject.targetHoursWeekly) || 10
    };
    setSubjects([...subjects, subj]);
    setIsSubjectModalOpen(false);
    toast.success(`Subject "${subj.name}" added successfully!`);
    setNewSubject({ name: "", code: "", color: "#38bdf8", targetHoursWeekly: 15 });
  };

  const deleteSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
    toast.info("Subject deleted");
  };

  const handleAddExam = (e) => {
    e.preventDefault();
    if (!newExam.title.trim() || !newExam.examDate) {
      toast.error("Exam title and date are required");
      return;
    }
    const exam = {
      id: "exam-" + Date.now(),
      ...newExam,
      active: exams.length === 0
    };
    setExams([...exams, exam]);
    setIsExamModalOpen(false);
    toast.success("Exam countdown added!");
    setNewExam({ title: "", examDate: "", location: "", notes: "", color: "#38bdf8" });
  };

  const setActiveExam = (id) => {
    setExams(exams.map(e => ({ ...e, active: e.id === id })));
    toast.success("Primary countdown exam updated!");
  };

  const deleteExam = (id) => {
    setExams(exams.filter(e => e.id !== id));
    toast.info("Exam countdown deleted");
  };

  // Calculations for dashboard stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = studyLogs.filter(l => l.date === todayStr);
  const totalHoursToday = todayLogs.reduce((acc, curr) => acc + curr.hours, 0);

  const totalHoursAllTime = studyLogs.reduce((acc, curr) => acc + curr.hours, 0);

  // Subject hours breakdown
  const subjectHoursMap = subjects.map(s => {
    const hrs = studyLogs.filter(l => l.subjectId === s.id).reduce((sum, l) => sum + l.hours, 0);
    return { ...s, loggedHours: hrs };
  });

  // Today's targets count
  const completedTargetsCount = targets.filter(t => t.completed).length;
  const totalTargetsCount = targets.length;
  const targetProgressPct = totalTargetsCount > 0 ? Math.round((completedTargetsCount / totalTargetsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-sky-500 selection:text-white pb-16">
      <Toaster position="top-right" richColors theme="dark" />

      {/* Top Navbar Header */}
      <header className="border-b border-slate-800/80 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
                ApexStudy <span className="text-xs uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono ml-2">Universal</span>
              </h1>
              <p className="text-xs text-slate-400">Your Ultimate Exam Countdown & Study Hours Tracker</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              data-testid="quick-log-btn"
              onClick={() => setIsLogModalOpen(true)}
              className="bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs sm:text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Log Hours</span>
            </Button>

            <Button 
              data-testid="quick-target-btn"
              onClick={() => setIsTargetModalOpen(true)}
              variant="outline"
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm hidden sm:flex items-center space-x-2"
            >
              <Target className="h-4 w-4 text-emerald-400" />
              <span>Add Target</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          <div className="flex space-x-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "timer", label: "Focus Timer", icon: Timer },
              { id: "calendar", label: "Calendar & Schedule", icon: CalendarIcon },
              { id: "subjects", label: "Subjects & Goals", icon: BookOpen },
              { id: "exams", label: "Exam Countdown", icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-testid={`nav-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-sm" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            
            {/* Top Banner: Exam Countdown & Quote */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Primary Countdown Widget */}
              <Card className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#131b2e] border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Primary Exam Target</span>
                    </div>
                    <Badge variant="outline" className="border-sky-500/30 text-sky-400 bg-sky-500/10 text-xs">
                      {primaryExam?.title || "Set Exam"}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-white mt-1">
                    {daysLeft} <span className="text-sm font-normal text-slate-400">Days Remaining</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-sky-400" />
                      <span>{primaryExam ? new Date(primaryExam.examDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "No Date"}</span>
                    </div>
                    <span className="text-emerald-400 font-medium">Exam Ready Mode</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      data-testid="go-exams-btn"
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab("exams")} 
                      className="w-full border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300"
                    >
                      Manage Exams
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Study Hours Summary */}
              <Card className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#131b2e] border-slate-800 shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Today's Progress</span>
                    <Flame className="h-4 w-4 text-orange-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mt-1">
                    {totalHoursToday} <span className="text-sm font-normal text-slate-400">/ 6.0 Target Hours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Daily Goal Completed</span>
                      <span className="text-sky-400 font-semibold">{Math.round((totalHoursToday / 6) * 100)}%</span>
                    </div>
                    <Progress value={Math.min(100, (totalHoursToday / 6) * 100)} className="h-2 bg-slate-800" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">All-time Logged: <strong className="text-slate-200">{totalHoursAllTime} hrs</strong></span>
                    <Button 
                      data-testid="log-hours-card-btn"
                      size="sm" 
                      onClick={() => setIsLogModalOpen(true)}
                      className="bg-sky-500 hover:bg-sky-600 text-white text-xs h-7 px-3"
                    >
                      + Log Session
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Motivational Quote & Streak */}
              <Card className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#131b2e] border-slate-800 shadow-xl flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Daily Inspiration</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                      onClick={() => setQuoteIdx((quoteIdx + 1) % motivationalQuotes.length)}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <p className="text-xs italic text-slate-300 leading-relaxed">
                    "{motivationalQuotes[quoteIdx].quote}"
                  </p>
                  <p className="text-[11px] text-sky-400 font-mono">— {motivationalQuotes[quoteIdx].author}</p>
                </CardContent>
              </Card>

            </div>

            {/* Middle Section: Today's Targets & Subject Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Today's Targets (Left 2 columns) */}
              <Card className="lg:col-span-2 bg-[#0f172a]/60 border-slate-800 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
                      <Target className="h-5 w-5 text-emerald-400" />
                      <span>Today's Targets & To-Dos</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      {completedTargetsCount} of {totalTargetsCount} targets completed ({targetProgressPct}%)
                    </CardDescription>
                  </div>
                  <Button 
                    data-testid="add-target-dashboard-btn"
                    size="sm" 
                    onClick={() => setIsTargetModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Target
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {targets.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No targets added yet. Click 'Add Target' to get started!
                    </div>
                  ) : (
                    targets.map((target) => {
                      const subject = subjects.find(s => s.id === target.subjectId);
                      return (
                        <div 
                          key={target.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                            target.completed 
                              ? "bg-slate-950/30 border-slate-800/50 opacity-60 line-through text-slate-400" 
                              : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <button 
                              data-testid={`toggle-target-${target.id}`}
                              onClick={() => toggleTargetComplete(target.id)}
                              className="text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                              {target.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-500" />
                              )}
                            </button>
                            <div>
                              <p className="text-sm font-medium">{target.text}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {subject && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ backgroundColor: `${subject.color}15`, color: subject.color, border: `1px solid ${subject.color}30` }}>
                                    {subject.name}
                                  </span>
                                )}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  target.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                  target.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {target.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            data-testid={`delete-target-${target.id}`}
                            onClick={() => deleteTarget(target.id)}
                            className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Subject Breakdown Widget (Right column) */}
              <Card className="bg-[#0f172a]/60 border-slate-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-sky-400" />
                    <span>Subject Hours Breakdown</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Total study hours per subject</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subjectHoursMap.map(subject => {
                    const pct = subject.targetHoursWeekly > 0 ? Math.min(100, Math.round((subject.loggedHours / subject.targetHoursWeekly) * 100)) : 0;
                    return (
                      <div key={subject.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-300 flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                            <span>{subject.name}</span>
                          </span>
                          <span className="font-mono text-slate-400">{subject.loggedHours}h / {subject.targetHoursWeekly}h</span>
                        </div>
                        <Progress value={pct} className="h-1.5 bg-slate-800" style={{ '--progress-background': subject.color }} />
                      </div>
                    );
                  })}
                  <Button 
                    data-testid="manage-subjects-btn"
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("subjects")}
                    className="w-full mt-2 border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300"
                  >
                    Customize Subjects & Goals
                  </Button>
                </CardContent>
              </Card>

            </div>

            {/* Recent Study Logs Section */}
            <Card className="bg-[#0f172a]/60 border-slate-800 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    <span>Recent Study Log History</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Your latest logged study sessions</CardDescription>
                </div>
                <Button 
                  data-testid="log-hours-main-btn"
                  size="sm" 
                  onClick={() => setIsLogModalOpen(true)}
                  className="bg-sky-500 hover:bg-sky-600 text-white text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Log Hours
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                      <tr>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Subject</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Hours</th>
                        <th className="pb-3 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {studyLogs.slice(0, 5).map(log => {
                        const subj = subjects.find(s => s.id === log.subjectId);
                        return (
                          <tr key={log.id} className="hover:bg-slate-900/40">
                            <td className="py-3 text-slate-400 font-mono">{log.date}</td>
                            <td className="py-3 font-medium text-slate-200">
                              <span className="inline-flex items-center space-x-1.5">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: subj?.color || '#38bdf8' }} />
                                <span>{subj?.name || "General Study"}</span>
                              </span>
                            </td>
                            <td className="py-3">
                              <Badge variant="outline" className="border-slate-700 bg-slate-800/40 text-slate-300 text-[10px]">
                                {log.type}
                              </Badge>
                            </td>
                            <td className="py-3 font-mono font-bold text-sky-400">{log.hours} hrs</td>
                            <td className="py-3 text-slate-400 max-w-xs truncate">{log.notes || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* TAB 2: FOCUS TIMER (POMODORO) */}
        {activeTab === "timer" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
            <Card className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#131b2e] border-slate-800 shadow-2xl text-center p-6 sm:p-10">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <Badge variant="outline" className={`border-sky-500/30 px-3 py-1 text-xs uppercase font-mono ${pomoMode === 'work' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {pomoMode === 'work' ? '🔥 Deep Focus Mode' : '☕ Relaxing Break'}
                  </Badge>
                </div>
                <CardTitle className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Pomodoro Study Timer
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                  Stay in the zone. Timer automatically logs study hours upon completion!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Subject Selector for Timer */}
                <div className="max-w-xs mx-auto text-left space-y-2">
                  <Label className="text-xs text-slate-400">Select Subject for This Session</Label>
                  <Select value={selectedPomoSubject} onValueChange={setSelectedPomoSubject}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-xs">
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Big Timer Display */}
                <div className="relative inline-flex items-center justify-center p-8 bg-slate-950/80 rounded-full border-4 border-slate-800 shadow-inner w-56 h-56 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-sky-500/5 animate-pulse" />
                  <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tighter text-white">
                    {String(pomoMinutes).padStart(2, '0')}:{String(pomoSeconds).padStart(2, '0')}
                  </span>
                </div>

                {/* Preset Buttons */}
                <div className="flex flex-wrap justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => resetPomodoro(25, "work")}
                    className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs"
                  >
                    25m Focus
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => resetPomodoro(50, "work")}
                    className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs"
                  >
                    50m Deep Work
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => resetPomodoro(5, "break")}
                    className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs text-emerald-400"
                  >
                    5m Break
                  </Button>
                </div>

                {/* Action Controls */}
                <div className="flex justify-center space-x-4">
                  <Button 
                    data-testid="pomo-toggle-btn"
                    onClick={togglePomodoro}
                    className={`px-8 py-6 text-base font-bold shadow-lg transition-all ${
                      pomoActive 
                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20" 
                        : "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20"
                    }`}
                  >
                    {pomoActive ? <><Pause className="mr-2 h-5 w-5" /> Pause Timer</> : <><Play className="mr-2 h-5 w-5" /> Start Focus</>}
                  </Button>
                  <Button 
                    data-testid="pomo-reset-btn"
                    variant="outline" 
                    onClick={() => resetPomodoro(25, "work")}
                    className="border-slate-700 bg-slate-800/40 hover:bg-slate-800 px-4 py-6 text-slate-300"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: CALENDAR & SCHEDULE */}
        {activeTab === "calendar" && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Study Calendar & Schedule</h2>
                <p className="text-xs text-slate-400">Overview of your study history and upcoming exam milestones</p>
              </div>
              <Button 
                onClick={() => setIsLogModalOpen(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white text-xs"
              >
                + Log Study Session
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Calendar Visual Mock / Summary */}
              <Card className="lg:col-span-2 bg-[#0f172a]/60 border-slate-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-sky-400" />
                    <span>July 2026 Study Activity Matrix</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Daily logged study hours distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Grid of days */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <span key={d} className="font-mono text-slate-500 py-1">{d}</span>
                    ))}
                    {Array.from({ length: 31 }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dateStr = `2026-07-${String(dayNum).padStart(2, '0')}`;
                      const logsForDay = studyLogs.filter(l => l.date === dateStr);
                      const totalHrs = logsForDay.reduce((sum, l) => sum + l.hours, 0);
                      const isToday = dateStr === todayStr;

                      return (
                        <div 
                          key={dayNum}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center min-h-[64px] transition-all ${
                            isToday ? 'border-sky-500 bg-sky-500/10' :
                            totalHrs > 4 ? 'border-emerald-500/40 bg-emerald-500/10' :
                            totalHrs > 0 ? 'border-sky-500/30 bg-sky-500/5' :
                            'border-slate-800 bg-slate-950/40 text-slate-600'
                          }`}
                        >
                          <span className={`font-mono text-xs ${isToday ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>{dayNum}</span>
                          {totalHrs > 0 ? (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 mt-1">{totalHrs}h</span>
                          ) : (
                            <span className="text-[9px] text-slate-600 mt-1">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Exam Deadlines Timeline */}
              <Card className="bg-[#0f172a]/60 border-slate-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span>Exam Milestones</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Upcoming scheduled tests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {exams.map(exam => {
                    const days = calculateDaysLeft(exam.examDate);
                    return (
                      <div key={exam.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-slate-200">{exam.title}</h4>
                          {exam.active && <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px]">Active</Badge>}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                          <span className="font-mono font-bold text-sky-400">{days} days left</span>
                        </div>
                      </div>
                    );
                  })}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("exams")}
                    className="w-full border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300"
                  >
                    View All Exams
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* TAB 4: SUBJECTS & GOALS */}
        {activeTab === "subjects" && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Customizable Subjects & Weekly Goals</h2>
                <p className="text-xs text-slate-400">Add or manage any subject, syllabus topics, and weekly hour quotas</p>
              </div>
              <Button 
                data-testid="open-add-subject-modal"
                onClick={() => setIsSubjectModalOpen(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add New Subject
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => {
                const logged = studyLogs.filter(l => l.subjectId === subject.id).reduce((sum, l) => sum + l.hours, 0);
                const pct = subject.targetHoursWeekly > 0 ? Math.min(100, Math.round((logged / subject.targetHoursWeekly) * 100)) : 0;

                return (
                  <Card key={subject.id} className="bg-[#0f172a]/60 border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: subject.color }} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="border-slate-700 bg-slate-800/50 text-slate-300 text-xs font-mono">
                          {subject.code}
                        </Badge>
                        <button 
                          data-testid={`delete-subject-${subject.id}`}
                          onClick={() => deleteSubject(subject.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <CardTitle className="text-base font-bold text-white mt-1">{subject.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Weekly Target Progress</span>
                          <span className="font-mono text-sky-400">{logged}h / {subject.targetHoursWeekly}h</span>
                        </div>
                        <Progress value={pct} className="h-2 bg-slate-800" />
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                        <span>Completion Rate</span>
                        <strong className="text-slate-200 font-mono">{pct}%</strong>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: EXAM COUNTDOWN */}
        {activeTab === "exams" && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Exam Countdowns & Milestones</h2>
                <p className="text-xs text-slate-400">Universal exam countdown tracker for any test, certification, or academic board</p>
              </div>
              <Button 
                data-testid="open-add-exam-modal"
                onClick={() => setIsExamModalOpen(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Exam Countdown
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map(exam => {
                const days = calculateDaysLeft(exam.examDate);
                return (
                  <Card key={exam.id} className={`bg-[#0f172a]/60 border shadow-xl relative ${exam.active ? 'border-sky-500/50 shadow-sky-500/10' : 'border-slate-800'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge className={exam.active ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400'}>
                          {exam.active ? 'Active Primary' : 'Exam Milestone'}
                        </Badge>
                        <button 
                          data-testid={`delete-exam-${exam.id}`}
                          onClick={() => deleteExam(exam.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <CardTitle className="text-lg font-bold text-white mt-2">{exam.title}</CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        {new Date(exam.examDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                        <span className="text-4xl font-extrabold font-mono text-sky-400">{days}</span>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">Days Remaining</p>
                      </div>

                      {exam.notes && (
                        <p className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                          {exam.notes}
                        </p>
                      )}

                      {!exam.active && (
                        <Button 
                          data-testid={`set-active-exam-${exam.id}`}
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveExam(exam.id)}
                          className="w-full border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-xs text-sky-400"
                        >
                          Set as Primary Countdown
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* MODALS */}

      {/* 1. Log Hours Modal */}
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Log Study Hours</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Record your focused study session time</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLog} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Subject</Label>
              <Select 
                value={newLog.subjectId} 
                onValueChange={(val) => setNewLog({ ...newLog, subjectId: val })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-xs">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Hours Studied</Label>
                <Input 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="16"
                  value={newLog.hours}
                  onChange={(e) => setNewLog({ ...newLog, hours: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Session Type</Label>
                <Select 
                  value={newLog.type} 
                  onValueChange={(val) => setNewLog({ ...newLog, type: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="Deep Work">Deep Work</SelectItem>
                    <SelectItem value="Revision">Revision</SelectItem>
                    <SelectItem value="Practice">Practice / Sums</SelectItem>
                    <SelectItem value="Lecture">Lecture / Video</SelectItem>
                    <SelectItem value="Mock Test">Mock Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Date</Label>
              <Input 
                type="date"
                value={newLog.date}
                onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Notes / Topics Covered</Label>
              <Textarea 
                placeholder="e.g. Solved 10 sums on capital gains & TDS..."
                value={newLog.notes}
                onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                className="bg-slate-950 border-slate-800 text-slate-200 text-xs h-20"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" data-testid="submit-log-btn" className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs">
                Save Study Session
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Add Target Modal */}
      <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add Daily Target</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Set a concrete milestone for today</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTarget} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Target Description</Label>
              <Input 
                placeholder="e.g. Complete Chapter 3 revision & mock test"
                value={newTarget.text}
                onChange={(e) => setNewTarget({ ...newTarget, text: e.target.value })}
                className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Subject</Label>
                <Select 
                  value={newTarget.subjectId} 
                  onValueChange={(val) => setNewTarget({ ...newTarget, subjectId: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-xs">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Priority</Label>
                <Select 
                  value={newTarget.priority} 
                  onValueChange={(val) => setNewTarget({ ...newTarget, priority: val })}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200 text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" data-testid="submit-target-btn" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                Add Target
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Add Subject Modal */}
      <Dialog open={isSubjectModalOpen} onOpenChange={setIsSubjectModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Subject</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Customize any subject or syllabus category</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubject} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Subject Name</Label>
              <Input 
                placeholder="e.g. Advanced Financial Management"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Code / Short Name</Label>
                <Input 
                  placeholder="e.g. AFM301"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Weekly Target (Hours)</Label>
                <Input 
                  type="number"
                  value={newSubject.targetHoursWeekly}
                  onChange={(e) => setNewSubject({ ...newSubject, targetHoursWeekly: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" data-testid="submit-subject-btn" className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs">
                Create Subject
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Add Exam Modal */}
      <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add Exam Countdown</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Set a target exam or test date</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExam} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Exam Title</Label>
              <Input 
                placeholder="e.g. Professional Board Exam Final"
                value={newExam.title}
                onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Exam Date</Label>
              <Input 
                type="date"
                value={newExam.examDate}
                onChange={(e) => setNewExam({ ...newExam, examDate: e.target.value })}
                className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Notes / Strategy</Label>
              <Textarea 
                placeholder="Key focus areas..."
                value={newExam.notes}
                onChange={(e) => setNewExam({ ...newExam, notes: e.target.value })}
                className="bg-slate-950 border-slate-800 text-slate-200 text-xs h-20"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" data-testid="submit-exam-btn" className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs">
                Save Exam Countdown
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
