import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Play,
  Pause,
  Plus,
  RotateCcw,
  Settings,
  Square,
  Target,
  Timer,
  TrendingUp,
  User,
  Users,
  X,

  // New icons
  /*
  Calendar as CalendarIcon,
  Clock,
  Award,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Flame,
  Sparkles,
  Edit3,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  ArrowRight,
  History,
  Layers,*/
} from "lucide-react";


import {
  COURSE_DATA,
  getCourse,
  initialExams,
  initialTargets,
  motivationalQuotes,
} from "./mock";

/* =========================================================
   STORAGE
========================================================= */

const SESSION_KEY = "apexstudy_current_user_v2";
const LEGACY_USERS_KEY = "apexstudy_users_v2";
const API_BASE = process.env.REACT_APP_API_URL || "/api";

const getLegacyUser = (email) => {
  try {
    const users = JSON.parse(localStorage.getItem(LEGACY_USERS_KEY)) || {};
    return users[email.trim().toLowerCase()] || null;
  } catch {
    return null;
  }
};

const getSessionToken = () =>
  localStorage.getItem(SESSION_KEY) || null;

const saveSessionToken = (token) => {
  if (token) {
    localStorage.setItem(SESSION_KEY, token);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

const api = async (path, { method = "GET", body } = {}) => {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
};

const createUserData = (courseId) => ({
  subjects: getCourse(courseId).subjects,
  sessions: [],
  targets: initialTargets.map((target) => ({
    ...target,
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  })),
  exams: initialExams,
  activeSession: null,
});

/* =========================================================
   HELPERS
========================================================= */

const formatTime = (seconds) => {
  const safe = Math.max(0, Math.floor(seconds || 0));

  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  return [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const formatHours = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const getDateLabel = (date) => {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   APP
========================================================= */

export default function App() {
   // ============================================================

  const [currentEmail, setCurrentEmail] = useState(null);
  const [users, setUsers] = useState({});
  const [authReady, setAuthReady] = useState(false);

  const [route, setRoute] = useState(
    window.location.pathname === "/"
      ? "/dashboard"
      : window.location.pathname
  );

  const [mobileMenu, setMobileMenu] = useState(false);

  const currentUser = currentEmail ? users[currentEmail] : null;

  useEffect(() => {
    const restoreSession = async () => {
      if (!getSessionToken()) {
        setAuthReady(true);
        return;
      }
      try {
        const { user } = await api("/auth/me");
        setUsers({ [user.email]: user });
        setCurrentEmail(user.email);
      } catch {
        saveSessionToken(null);
      } finally {
        setAuthReady(true);
      }
    };
    restoreSession();
  }, []);

  /* -------------------------------------------------------
     ROUTING
  ------------------------------------------------------- */

  const navigate = useCallback((path) => {
    window.history.pushState({}, "", path);
    setRoute(path);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(
        window.location.pathname === "/"
          ? "/dashboard"
          : window.location.pathname
      );
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  /* -------------------------------------------------------
     LOGIN
  ------------------------------------------------------- */

  const login = async ({ email, password }) => {
    try {
      const { token, user } = await api("/auth/login", { method: "POST", body: { email, password } });
      saveSessionToken(token);
      setUsers({ [user.email]: user });
      setCurrentEmail(user.email);
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      const legacyUser = getLegacyUser(email);
      if (!legacyUser || legacyUser.password !== password) {
        return { success: false, message: error.message };
      }
      try {
        const { token, user } = await api("/auth/migrate", { method: "POST", body: { user: legacyUser, password } });
        saveSessionToken(token);
        setUsers({ [user.email]: user });
        setCurrentEmail(user.email);
        navigate("/dashboard");
        return { success: true };
      } catch (migrationError) {
        return { success: false, message: migrationError.message };
      }
    }
  };

  const signup = async ({
    name,
    email,
    password,
    course,
    attempt,
    dailyGoal,
  }) => {
    try {
      const { token, user } = await api("/auth/signup", {
        method: "POST",
        body: { name, email, password, course, attempt, dailyGoal: Number(dailyGoal) || 6, ...createUserData(course) },
      });
      saveSessionToken(token);
      setUsers({ [user.email]: user });
      setCurrentEmail(user.email);
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    saveSessionToken(null);
    setCurrentEmail(null);
    navigate("/login");
  };

  /* -------------------------------------------------------
     UPDATE USER
  ------------------------------------------------------- */

  const updateUser = useCallback(
    (updates) => {
      if (!currentEmail) return;

      setUsers((previous) => {
        const updated = {
          ...previous,
          [currentEmail]: {
            ...previous[currentEmail],
            ...updates,
          },
        };

        return updated;
      });
      api("/users/me", { method: "PATCH", body: updates }).catch((error) => {
        console.error("Unable to save changes:", error.message);
      });
    },
    [currentEmail]
  );

  /* -------------------------------------------------------
     SESSION DATA
  ------------------------------------------------------- */

  const updateSessions = useCallback(
    (sessions) => {
      updateUser({ sessions });
    },
    [updateUser]
  );

  /* -------------------------------------------------------
     ACTIVE STOPWATCH
  ------------------------------------------------------- */

  const [timerNow, setTimerNow] = useState(Date.now());

  const activeSession = currentUser?.activeSession || null;

  useEffect(() => {
    if (!activeSession || activeSession.status !== "running") {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimerNow(Date.now());
    }, 500);

    return () => clearInterval(interval);
  }, [activeSession]);

  const activeElapsed = useMemo(() => {
    if (!activeSession) return 0;

    if (activeSession.status === "paused") {
      return activeSession.accumulatedSeconds;
    }

    return (
      activeSession.accumulatedSeconds +
      Math.floor((timerNow - activeSession.startedAt) / 1000)
    );
  }, [activeSession, timerNow]);

  const startStudy = ({
    subjectId,
    topic,
    type,
  }) => {
    const session = {
      id: `session-${Date.now()}`,
      subjectId,
      topic: topic || "",
      type: type || "Deep Work",
      startedAt: Date.now(),
      accumulatedSeconds: 0,
      status: "running",
    };

    updateUser({
      activeSession: session,
    });

    navigate("/timer");
  };

  const pauseStudy = () => {
    if (!activeSession) return;

    const elapsed =
      activeSession.accumulatedSeconds +
      Math.floor((Date.now() - activeSession.startedAt) / 1000);

    updateUser({
      activeSession: {
        ...activeSession,
        status: "paused",
        accumulatedSeconds: elapsed,
        pausedAt: Date.now(),
      },
    });
  };

  const resumeStudy = () => {
    if (!activeSession) return;

    updateUser({
      activeSession: {
        ...activeSession,
        status: "running",
        startedAt: Date.now(),
        pausedAt: null,
      },
    });
  };

  const stopStudy = () => {
    if (!activeSession) return;

    const elapsed =
      activeSession.status === "paused"
        ? activeSession.accumulatedSeconds
        : activeSession.accumulatedSeconds +
          Math.floor((Date.now() - activeSession.startedAt) / 1000);

    if (elapsed < 5) {
      updateUser({
        activeSession: null,
      });

      return;
    }

    const completedSession = {
      id: activeSession.id,
      subjectId: activeSession.subjectId,
      topic: activeSession.topic,
      type: activeSession.type,
      startedAt: activeSession.startedAt,
      endedAt: Date.now(),
      durationSeconds: elapsed,
    };

    updateUser({
      activeSession: null,
      sessions: [
        completedSession,
        ...(currentUser.sessions || []),
      ],
    });

    navigate("/history");
  };

  /* -------------------------------------------------------
     NOT LOGGED IN
  ------------------------------------------------------- */

  if (!authReady || (!currentUser && getSessionToken())) {
    return <div className="min-h-screen bg-[#070b14]" />;
  }

  if (!currentUser || !currentEmail) {
    return (
      <AuthScreen
        onLogin={login}
        onSignup={signup}
      />
    );
  }
  
  /* -------------------------------------------------------
     MAIN APP
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        {/* DESKTOP SIDEBAR */}

        <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-800/70 bg-slate-950/80 backdrop-blur-xl flex-col sticky top-0 h-screen">
          <Sidebar
            currentUser={currentUser}
            route={route}
            navigate={navigate}
            logout={logout}
          />
        </aside>

        {/* MOBILE MENU */}

        {mobileMenu && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setMobileMenu(false)}
            />

            <aside className="relative w-72 h-full bg-slate-950 border-r border-slate-800">
              <Sidebar
                currentUser={currentUser}
                route={route}
                navigate={navigate}
                logout={logout}
              />
            </aside>
          </div>
        )}

        {/* CONTENT */}

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-800/70 bg-[#070b14]/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenu(true)}
                  className="lg:hidden rounded-xl border border-slate-800 bg-slate-900 p-2"
                >
                  <Menu size={19} />
                </button>

                {route !== "/dashboard" && (
                  <button
                    onClick={goBack}
                    className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <ArrowLeft size={16} />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                )}

                <div>
                  <p className="text-xs text-slate-500">
                    {getCourse(currentUser.course).name}
                  </p>

                  <h1 className="font-semibold text-white">
                    {getPageTitle(route)}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {activeSession && (
                  <button
                    onClick={() => navigate("/timer")}
                    className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    {formatTime(activeElapsed)}
                  </button>
                )}

                <button
                  onClick={() => navigate("/profile")}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-500 font-semibold"
                >
                  {currentUser.name?.charAt(0)?.toUpperCase()}
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {route === "/dashboard" && (
              <Dashboard
                user={currentUser}
                sessions={currentUser.sessions || []}
                subjects={currentUser.subjects || []}
                targets={currentUser.targets || []}
                activeElapsed={activeElapsed}
                activeSession={activeSession}
                navigate={navigate}
                updateUser={updateUser}
              />
            )}

            {route === "/timer" && (
              <TimerPage
                user={currentUser}
                subjects={currentUser.subjects || []}
                activeSession={activeSession}
                elapsed={activeElapsed}
                startStudy={startStudy}
                pauseStudy={pauseStudy}
                resumeStudy={resumeStudy}
                stopStudy={stopStudy}
              />
            )}

            {route === "/subjects" && (
              <SubjectsPage
                subjects={currentUser.subjects || []}
                sessions={currentUser.sessions || []}
                navigate={navigate}
              />
            )}

            {route.startsWith("/subjects/") && (
              <SubjectPage
                subjectId={route.split("/")[2]}
                subjects={currentUser.subjects || []}
                sessions={currentUser.sessions || []}
                goBack={goBack}
              />
            )}

            {route === "/history" && (
              <HistoryPage
                sessions={currentUser.sessions || []}
                subjects={currentUser.subjects || []}
              />
            )}

            {route === "/targets" && (
              <TargetsPage
                user={currentUser}
                updateUser={updateUser}
              />
            )}

            {route === "/exams" && (
              <ExamsPage
                user={currentUser}
                updateUser={updateUser}
              />
            )}

            {route === "/analytics" && (
              <AnalyticsPage
                sessions={currentUser.sessions || []}
                subjects={currentUser.subjects || []}
                user={currentUser}
              />
            )}

            {route === "/profile" && (
              <ProfilePage
                user={currentUser}
                updateUser={updateUser}
                logout={logout}
              />
            )}

            {route === "/admin" && currentUser.role === "admin" && (
              <AdminPage />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  currentUser,
  route,
  navigate,
  logout,
}) {
  const links = [
    {
      path: "/dashboard",
      label: "Overview",
      icon: Home,
    },
    {
      path: "/timer",
      label: "Study Timer",
      icon: Timer,
    },
    {
      path: "/subjects",
      label: "Subjects",
      icon: BookOpen,
    },
    {
      path: "/history",
      label: "Study History",
      icon: Clock3,
    },
    {
      path: "/targets",
      label: "Daily Targets",
      icon: Target,
    },
    {
      path: "/exams",
      label: "Exams",
      icon: CalendarDays,
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    ...(currentUser.role === "admin"
      ? [{ path: "/admin", label: "Admin panel", icon: Users }]
      : []),
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800/70 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 shadow-lg shadow-sky-500/10">
          <GraduationCap size={20} />
        </div>

        <div>
          <p className="font-bold tracking-tight">ApexStudy</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            Study smarter
          </p>
        </div>
      </div>

      <div className="flex-1 p-3">
        <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Workspace
        </p>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              route === link.path ||
              (link.path === "/subjects" &&
                route.startsWith("/subjects/"));

            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-sky-500/10 text-sky-400"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800/70 p-3">
        <button
          onClick={() => navigate("/profile")}
          className="mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-900"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-500 font-bold">
            {currentUser.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {currentUser.name}
            </p>

            <p className="truncate text-xs text-slate-500">
              {currentUser.email}
            </p>
          </div>
        </button>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

function AuthScreen({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login");

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 shadow-xl shadow-sky-500/20">
              <GraduationCap size={28} />
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              ApexStudy
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Track effective study hours. Build consistency.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            {mode === "login" ? (
              <LoginForm
                onLogin={onLogin}
                switchToSignup={() => setMode("signup")}
              />
            ) : (
              <SignupForm
                onSignup={onSignup}
                switchToLogin={() => setMode("login")}
              />
            )}
          </div>

          <p className="mt-5 text-center text-xs text-slate-600">
            Your local account data is stored in this browser.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin, switchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await onLogin({
      email,
      password,
    });

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">
          Continue your study journey.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
      />

      <InputField
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
      />

      <button className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white transition hover:bg-sky-400">
        Sign in
      </button>

      <p className="text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={switchToSignup}
          className="font-medium text-sky-400 hover:text-sky-300"
        >
          Create one
        </button>
      </p>
    </form>
  );
}

function SignupForm({ onSignup, switchToLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    course: "intermediate",
    attempt: "",
    dailyGoal: 6,
  });

  const [error, setError] = useState("");

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    const result = await onSignup(form);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Create your account</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your study data will be linked to your account.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <InputField
        label="Full name"
        value={form.name}
        onChange={(value) => update("name", value)}
        placeholder="Your name"
      />

      <InputField
        label="Email"
        type="email"
        value={form.email}
        onChange={(value) => update("email", value)}
        placeholder="you@example.com"
      />

      <InputField
        label="Password"
        type="password"
        value={form.password}
        onChange={(value) => update("password", value)}
        placeholder="Minimum 6 characters"
      />

      <div>
        <label className="mb-2 block text-xs font-medium text-slate-400">
          What are you preparing for?
        </label>

        <div className="grid grid-cols-3 gap-2">
          {Object.values(COURSE_DATA).map((course) => (
            <button
              type="button"
              key={course.id}
              onClick={() => update("course", course.id)}
              className={`rounded-xl border p-3 text-xs transition ${
                form.course === course.id
                  ? "border-sky-500 bg-sky-500/10 text-sky-400"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
              }`}
            >
              {course.shortName}
            </button>
          ))}
        </div>
      </div>

      <InputField
        label="Exam attempt"
        value={form.attempt}
        onChange={(value) => update("attempt", value)}
        placeholder="e.g. May 2027"
      />

      <div>
        <label className="mb-2 block text-xs font-medium text-slate-400">
          Daily study goal
        </label>

        <select
          value={form.dailyGoal}
          onChange={(e) =>
            update("dailyGoal", e.target.value)
          }
          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-sky-500"
        >
          {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((hour) => (
            <option key={hour} value={hour}>
              {hour} hours
            </option>
          ))}
        </select>
      </div>

      <button className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-white transition hover:bg-sky-400">
        Create account
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={switchToLogin}
          className="font-medium text-sky-400 hover:text-sky-300"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-400">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
      />
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  user,
  sessions,
  subjects,
  targets,
  activeElapsed,
  activeSession,
  navigate,
  updateUser,
}) {
  const today = todayKey();

  const todaySeconds = sessions
    .filter(
      (session) =>
        session.endedAt &&
        new Date(session.endedAt).toISOString().slice(0, 10) === today
    )
    .reduce(
      (total, session) =>
        total + Number(session.durationSeconds || 0),
      0
    );

  const totalSeconds = sessions.reduce(
    (total, session) =>
      total + Number(session.durationSeconds || 0),
    0
  );

  const goalSeconds = Number(user.dailyGoal || 6) * 3600;

  const progress = Math.min(
    100,
    Math.round((todaySeconds / goalSeconds) * 100)
  );

  const quote =
    motivationalQuotes[
      new Date().getDate() % motivationalQuotes.length
    ];

  const subjectSeconds = (subjectId) =>
    sessions
      .filter((session) => session.subjectId === subjectId)
      .reduce(
        (total, session) =>
          total + Number(session.durationSeconds || 0),
        0
      );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-slate-500">
          {getGreeting()}
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {user.name.split(" ")[0]} 👋
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {getCourse(user.course).name}
          {user.attempt ? ` · ${user.attempt}` : ""}
        </p>
      </section>

      {/* TIMER HERO */}

      <section className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-slate-950 to-violet-500/10 p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-400">
                <Clock3 size={13} />
                Effective study time today
              </div>

              <div className="text-5xl font-bold tracking-tight sm:text-6xl">
                {formatTime(todaySeconds + activeElapsed)}
              </div>

              <p className="mt-3 text-sm text-slate-500">
                Goal: {user.dailyGoal} hours today
              </p>
            </div>

            <button
              onClick={() => navigate("/timer")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-4 font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
            >
              {activeSession ? (
                <>
                  <Timer size={20} />
                  Continue session
                </>
              ) : (
                <>
                  <Play size={20} />
                  Start studying
                </>
              )}
            </button>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-slate-500">
                Daily progress
              </span>

              <span className="text-sky-400">
                {progress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Clock3}
          label="Today"
          value={formatHours(todaySeconds)}
          subtitle={`of ${user.dailyGoal}h goal`}
        />

        <StatCard
          icon={TrendingUp}
          label="All time"
          value={formatHours(totalSeconds)}
          subtitle={`${sessions.length} sessions`}
        />

        <StatCard
          icon={BookOpen}
          label="Subjects"
          value={subjects.length}
          subtitle="active subjects"
        />

        <StatCard
          icon={Target}
          label="Targets"
          value={targets.filter((x) => x.completed).length}
          subtitle={`of ${targets.length} completed`}
        />
      </section>

      {/* QUICK START */}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Quick start</h3>
            <p className="text-xs text-slate-500">
              Jump straight into a subject.
            </p>
          </div>

          <button
            onClick={() => navigate("/subjects")}
            className="text-xs text-sky-400 hover:text-sky-300"
          >
            View all
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.slice(0, 6).map((subject) => (
            <button
              key={subject.id}
              onClick={() =>
                navigate(`/subjects/${subject.id}`)
              }
              className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: subject.color }}
                />

                <ChevronRight
                  size={17}
                  className="text-slate-700 transition group-hover:text-slate-400"
                />
              </div>

              <h4 className="mt-5 font-medium">
                {subject.name}
              </h4>

              <p className="mt-1 text-xs text-slate-500">
                {formatHours(subjectSeconds(subject.id))} studied
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* RECENT */}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Recent sessions</h3>

            <button
              onClick={() => navigate("/history")}
              className="text-xs text-sky-400"
            >
              View history
            </button>
          </div>

          {sessions.length === 0 ? (
            <EmptyState
              icon={Clock3}
              text="Your completed study sessions will appear here."
            />
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => {
                const subject = subjects.find(
                  (s) => s.id === session.subjectId
                );

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          background:
                            subject?.color || "#38bdf8",
                        }}
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {subject?.name || "Study session"}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {session.topic ||
                            session.type ||
                            "Study"}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-sm font-medium text-sky-400">
                      {formatTime(session.durationSeconds)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="mb-5">
            <h3 className="font-semibold">Daily targets</h3>
            <p className="text-xs text-slate-500">
              Keep your plan visible.
            </p>
          </div>

          {targets.length === 0 ? (
            <EmptyState
              icon={Target}
              text="No targets yet."
            />
          ) : (
            <div className="space-y-3">
              {targets.slice(0, 5).map((target) => (
                <button
                  key={target.id}
                  onClick={() =>
                    updateUser({
                      targets: targets.map((item) =>
                        item.id === target.id
                          ? {
                              ...item,
                              completed: !item.completed,
                            }
                          : item
                      ),
                    })
                  }
                  className="flex w-full items-center gap-3 rounded-xl bg-slate-900/60 p-3 text-left"
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      target.completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-700"
                    }`}
                  >
                    {target.completed && <Check size={14} />}
                  </div>

                  <span
                    className={`text-sm ${
                      target.completed
                        ? "text-slate-600 line-through"
                        : "text-slate-300"
                    }`}
                  >
                    {target.text}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5">
        <p className="text-sm italic text-slate-400">
          “{quote.quote}”
        </p>

        <p className="mt-2 text-xs text-slate-600">
          — {quote.author}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   TIMER
========================================================= */

function TimerPage({
  subjects,
  activeSession,
  elapsed,
  startStudy,
  pauseStudy,
  resumeStudy,
  stopStudy,
}) {
  const [subjectId, setSubjectId] = useState(
    subjects[0]?.id || ""
  );

  const [topic, setTopic] = useState("");

  const [type, setType] = useState("Deep Work");

  if (!activeSession) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-slate-500">
            Effective study tracker
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            Start a study session
          </h2>

          <p className="mt-2 text-slate-500">
            The stopwatch records only the time you actively
            study.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl sm:p-8">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                What are you studying?
              </label>

              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
              >
                {subjects.map((subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Topic / chapter
              </label>

              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Capital Gains"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Study mode
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  "Deep Work",
                  "Revision",
                  "Practice",
                  "Mock Test",
                ].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setType(item)}
                    className={`rounded-xl border px-3 py-3 text-xs ${
                      type === item
                        ? "border-sky-500 bg-sky-500/10 text-sky-400"
                        : "border-slate-800 bg-slate-900 text-slate-500"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                startStudy({
                  subjectId,
                  topic,
                  type,
                })
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 py-4 font-semibold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400"
            >
              <Play size={20} />
              Start studying
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subject = subjects.find(
    (item) => item.id === activeSession.subjectId
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-sky-500/10 p-6 text-center sm:p-12">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            {activeSession.status === "paused"
              ? "Paused"
              : "Study session active"}
          </div>

          <div className="text-6xl font-bold tracking-tight sm:text-8xl">
            {formatTime(elapsed)}
          </div>

          <h2 className="mt-7 text-xl font-semibold">
            {subject?.name}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {activeSession.topic ||
              activeSession.type ||
              "Focused study"}
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            {activeSession.status === "running" ? (
              <button
                onClick={pauseStudy}
                className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-7 py-4 font-semibold text-amber-400 hover:bg-amber-500/20"
              >
                <Pause size={19} />
                Pause
              </button>
            ) : (
              <button
                onClick={resumeStudy}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-7 py-4 font-semibold text-white hover:bg-emerald-400"
              >
                <Play size={19} />
                Resume
              </button>
            )}

            <button
              onClick={stopStudy}
              className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-7 py-4 font-semibold text-red-400 hover:bg-red-500/20"
            >
              <Square size={18} />
              Stop & save
            </button>
          </div>

          <p className="mt-8 text-xs text-slate-600">
            Your session is saved automatically. Refreshing
            the page will not reset the timer.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUBJECTS
========================================================= */

function SubjectsPage({
  subjects,
  sessions,
  navigate,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Your subjects
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Track effective hours for every subject.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => {
          const seconds = sessions
            .filter(
              (session) =>
                session.subjectId === subject.id
            )
            .reduce(
              (total, session) =>
                total + Number(session.durationSeconds || 0),
              0
            );

          return (
            <button
              key={subject.id}
              onClick={() =>
                navigate(`/subjects/${subject.id}`)
              }
              className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-left transition hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div
                  className="h-10 w-10 rounded-xl"
                  style={{
                    background: `${subject.color}20`,
                    border: `1px solid ${subject.color}40`,
                  }}
                />

                <ChevronRight
                  size={18}
                  className="text-slate-700 group-hover:text-slate-400"
                />
              </div>

              <p className="mt-5 text-xs text-slate-500">
                {subject.code}
              </p>

              <h3 className="mt-1 font-semibold">
                {subject.name}
              </h3>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {formatHours(seconds)}
                  </p>

                  <p className="text-xs text-slate-600">
                    effective study
                  </p>
                </div>

                <p className="text-xs text-slate-500">
                  {subject.targetHoursWeekly}h/week
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   SUBJECT DETAILS
========================================================= */

function SubjectPage({
  subjectId,
  subjects,
  sessions,
  goBack,
}) {
  const subject = subjects.find(
    (item) => item.id === subjectId
  );

  if (!subject) {
    return (
      <EmptyState
        icon={BookOpen}
        text="Subject not found."
      />
    );
  }

  const subjectSessions = sessions.filter(
    (session) => session.subjectId === subjectId
  );

  const total = subjectSessions.reduce(
    (sum, session) =>
      sum + Number(session.durationSeconds || 0),
    0
  );

  return (
    <div className="space-y-6">
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to subjects
      </button>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 sm:p-8">
        <div
          className="mb-5 h-3 w-16 rounded-full"
          style={{ background: subject.color }}
        />

        <p className="text-xs text-slate-500">
          {subject.code}
        </p>

        <h2 className="mt-1 text-3xl font-bold">
          {subject.name}
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Clock3}
            label="Effective time"
            value={formatHours(total)}
            subtitle="all time"
          />

          <StatCard
            icon={Activity}
            label="Sessions"
            value={subjectSessions.length}
            subtitle="completed"
          />

          <StatCard
            icon={Target}
            label="Weekly goal"
            value={`${subject.targetHoursWeekly}h`}
            subtitle="target"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <h3 className="mb-4 font-semibold">
          Session history
        </h3>

        {subjectSessions.length === 0 ? (
          <EmptyState
            icon={Clock3}
            text="No sessions for this subject yet."
          />
        ) : (
          <div className="space-y-2">
            {subjectSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl bg-slate-900/60 p-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {session.topic ||
                      session.type ||
                      "Study session"}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {getDateLabel(session.endedAt)}
                  </p>
                </div>

                <p className="font-semibold text-sky-400">
                  {formatTime(session.durationSeconds)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   HISTORY
========================================================= */

function HistoryPage({
  sessions,
  subjects,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Study history
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Every completed effective study session.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60">
        {sessions.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={Clock3}
              text="No completed study sessions yet."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {sessions.map((session) => {
              const subject = subjects.find(
                (item) =>
                  item.id === session.subjectId
              );

              return (
                <div
                  key={session.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        background:
                          subject?.color || "#38bdf8",
                      }}
                    />

                    <div>
                      <p className="font-medium">
                        {subject?.name ||
                          "Unknown subject"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {session.topic ||
                          session.type ||
                          "Study session"}
                      </p>

                      <p className="mt-1 text-xs text-slate-700">
                        {getDateLabel(session.endedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xl font-bold text-sky-400">
                      {formatTime(
                        session.durationSeconds
                      )}
                    </p>

                    <p className="text-xs text-slate-600">
                      effective time
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   TARGETS
========================================================= */

function TargetsPage({
  user,
  updateUser,
}) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("Medium");

  const targets = user.targets || [];

  const addTarget = (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    updateUser({
      targets: [
        {
          id: `target-${Date.now()}`,
          text: text.trim(),
          priority,
          completed: false,
        },
        ...targets,
      ],
    });

    setText("");
  };

  const toggle = (id) => {
    updateUser({
      targets: targets.map((target) =>
        target.id === id
          ? {
              ...target,
              completed: !target.completed,
            }
          : target
      ),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Daily targets
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Turn your study plan into clear actions.
        </p>
      </div>

      <form
        onSubmit={addTarget}
        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Complete Chapter 4 revision"
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-sky-500"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold">
            <Plus size={17} />
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {targets.map((target) => (
          <button
            key={target.id}
            onClick={() => toggle(target.id)}
            className="flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left"
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                target.completed
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-700"
              }`}
            >
              {target.completed && <Check size={15} />}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm ${
                  target.completed
                    ? "text-slate-600 line-through"
                    : "text-slate-200"
                }`}
              >
                {target.text}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {target.priority} priority
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   EXAMS
========================================================= */

function ExamsPage({ user, updateUser }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const exams = user.exams || [];

  const addExam = (e) => {
    e.preventDefault();

    if (!title || !date) return;

    updateUser({
      exams: [
        ...exams,
        {
          id: `exam-${Date.now()}`,
          title,
          examDate: date,
        },
      ],
    });

    setTitle("");
    setDate("");
  };

  const daysUntil = (dateString) => {
    const diff =
      new Date(dateString).getTime() - Date.now();

    return Math.max(
      0,
      Math.ceil(diff / 86400000)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Exam countdowns
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Keep important dates visible.
        </p>
      </div>

      <form
        onSubmit={addExam}
        className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-[1fr_180px_auto]"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Exam name"
          className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-sky-500"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm"
        />

        <button className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold">
          Add exam
        </button>
      </form>

      {exams.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          text="No exams added yet."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
            >
              <p className="text-xs text-slate-500">
                {getDateLabel(exam.examDate)}
              </p>

              <h3 className="mt-2 font-semibold">
                {exam.title}
              </h3>

              <div className="mt-6">
                <p className="text-4xl font-bold text-sky-400">
                  {daysUntil(exam.examDate)}
                </p>

                <p className="text-xs text-slate-500">
                  days remaining
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function AnalyticsPage({
  sessions,
  subjects,
  user,
}) {
  const totalSeconds = sessions.reduce(
    (sum, session) =>
      sum + Number(session.durationSeconds || 0),
    0
  );

  const subjectData = subjects.map((subject) => {
    const seconds = sessions
      .filter(
        (session) => session.subjectId === subject.id
      )
      .reduce(
        (sum, session) =>
          sum + Number(session.durationSeconds || 0),
        0
      );

    return {
      ...subject,
      seconds,
    };
  });

  const maxSeconds = Math.max(
    ...subjectData.map((item) => item.seconds),
    1
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Study analytics
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          See where your effective study time is going.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Clock3}
          label="Total study time"
          value={formatHours(totalSeconds)}
          subtitle="all completed sessions"
        />

        <StatCard
          icon={Activity}
          label="Sessions"
          value={sessions.length}
          subtitle="completed"
        />

        <StatCard
          icon={Target}
          label="Daily target"
          value={`${user.dailyGoal}h`}
          subtitle="your goal"
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6">
        <h3 className="font-semibold">
          Time by subject
        </h3>

        <div className="mt-6 space-y-5">
          {subjectData.map((subject) => (
            <div key={subject.id}>
              <div className="mb-2 flex justify-between text-sm">
                <span>{subject.name}</span>

                <span className="text-slate-500">
                  {formatHours(subject.seconds)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-900">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${
                      (subject.seconds / maxSeconds) *
                      100
                    }%`,
                    background: subject.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN
========================================================= */

function AdminPage() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { users } = await api("/admin/users");
        setAccounts(users);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const totalStudySeconds = accounts.reduce(
    (total, account) => total + (account.sessions || []).reduce((sum, session) => sum + (session.durationSeconds || 0), 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin panel</h2>
        <p className="mt-1 text-sm text-slate-500">See registered users and their study progress.</p>
      </div>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Registered users" value={accounts.length} subtitle="Including administrator accounts" />
        <StatCard icon={Clock3} label="Study time logged" value={formatHours(totalStudySeconds)} subtitle="Across all users" />
        <StatCard icon={BookOpen} label="Study sessions" value={accounts.reduce((total, account) => total + (account.sessions || []).length, 0)} subtitle="Completed sessions" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Preparing for</th><th className="px-5 py-4">Sessions</th><th className="px-5 py-4">Study time</th><th className="px-5 py-4">Joined</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {!loading && accounts.map((account) => {
                const seconds = (account.sessions || []).reduce((sum, session) => sum + (session.durationSeconds || 0), 0);
                return <tr key={account.id} className="text-slate-300"><td className="px-5 py-4"><p className="font-medium text-white">{account.name}</p><p className="text-xs text-slate-500">{account.email}{account.role === "admin" ? " · Admin" : ""}</p></td><td className="px-5 py-4">{getCourse(account.course).name}</td><td className="px-5 py-4">{(account.sessions || []).length}</td><td className="px-5 py-4">{formatHours(seconds)}</td><td className="px-5 py-4 text-slate-500">{getDateLabel(account.createdAt)}</td></tr>;
              })}
              {loading && <tr><td colSpan="5" className="px-5 py-8 text-center text-slate-500">Loading users…</td></tr>}
              {!loading && accounts.length === 0 && <tr><td colSpan="5" className="px-5 py-8 text-center text-slate-500">No users yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfilePage({
  user,
  updateUser,
  logout,
}) {
  const [name, setName] = useState(user.name);
  const [attempt, setAttempt] = useState(
    user.attempt || ""
  );
  const [goal, setGoal] = useState(user.dailyGoal);
  const [course, setCourse] = useState(user.course);

  const save = () => {
    updateUser({
      name,
      attempt,
      dailyGoal: Number(goal),
      course,
      ...(course !== user.course
        ? { subjects: getCourse(course).subjects, activeSession: null }
        : {}),
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Profile & settings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your study profile.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="font-semibold">
              {user.name}
            </h3>

            <p className="text-sm text-slate-500">
              {user.email}
            </p>

            <p className="mt-1 text-xs text-sky-400">
              {getCourse(user.course).name}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <InputField
            label="Name"
            value={name}
            onChange={setName}
          />

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Exam attempt
            </label>

            <input
              value={attempt}
              onChange={(e) =>
                setAttempt(e.target.value)
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-sky-500"
              placeholder="e.g. May 2027"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Preparing for
            </label>

            <div className="grid grid-cols-3 gap-2">
              {Object.values(COURSE_DATA).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setCourse(item.id)}
                  className={`rounded-xl border p-3 text-xs transition ${
                    course === item.id
                      ? "border-sky-500 bg-sky-500/10 text-sky-400"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {item.shortName}
                </button>
              ))}
            </div>

            {course !== user.course && (
              <p className="mt-2 text-xs text-amber-400">
                Saving will replace your active subject list with starter subjects for this path. Your completed history stays saved.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Daily study goal
            </label>

            <select
              value={goal}
              onChange={(e) =>
                setGoal(e.target.value)
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm"
            >
              {[2, 3, 4, 5, 6, 7, 8, 10, 12].map(
                (hour) => (
                  <option key={hour} value={hour}>
                    {hour} hours
                  </option>
                )
              )}
            </select>
          </div>

          <button
            onClick={save}
            className="w-full rounded-xl bg-sky-500 py-3 font-semibold hover:bg-sky-400"
          >
            Save changes
          </button>
        </div>
      </div>

      <button
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10"
      >
        <LogOut size={17} />
        Logout
      </button>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-slate-900 p-2.5 text-sky-400">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-5 text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {subtitle}
      </p>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-12 text-center">
      <Icon size={26} className="text-slate-700" />

      <p className="mt-3 max-w-xs text-sm text-slate-600">
        {text}
      </p>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}


function getPageTitle(route) {
  if (route === "/dashboard") return "Overview";
  if (route === "/timer") return "Study Timer";
  if (route === "/subjects") return "Subjects";
  if (route.startsWith("/subjects/"))
    return "Subject Details";
  if (route === "/history") return "Study History";
  if (route === "/targets") return "Daily Targets";
  if (route === "/exams") return "Exams";
  if (route === "/analytics") return "Analytics";
  if (route === "/admin") return "Admin panel";
  if (route === "/profile") return "Profile";

  return "ApexStudy";
}
//netlify check