import { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DailyLog from "./pages/DailyLog";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import SmartNav from "./components/SmartNav";

function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDailyLog = async (userId: string) => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lt("created_at", `${today}T23:59:59.999Z`);

      if (data && data.length > 0) {
        console.log("User already logged today. Hiding window.");
        if (window.electronAPI) window.electronAPI.reportStatus("hide");
      } else {
        console.log("User hasn't logged today. Showing window.");
        if (window.electronAPI) window.electronAPI.reportStatus("show");
        // Removed forced navigation to allow user freedom
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        checkDailyLog(session.user.id);
      } else {
        if (window.electronAPI) window.electronAPI.reportStatus("show");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        if (session?.user) {
          checkDailyLog(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pure-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-pure-black text-white font-sans overflow-hidden relative">
      <main className="flex-1 relative w-full h-full">
        <Routes>
          <Route
            path="/login"
            element={!session ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/daily-log"
            element={session ? <DailyLog /> : <Navigate to="/login" />}
          />
          <Route
            path="/calendar"
            element={session ? <Calendar /> : <Navigate to="/login" />}
          />
          <Route
            path="/analytics"
            element={session ? <Analytics /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={session ? <Dashboard /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
      {session && <SmartNav />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
