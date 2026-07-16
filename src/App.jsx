import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PasteToTrack from "./pages/PasteToTrack";
import ResumeOptimizer from "./pages/ResumeOptimizer";
import Profile from "./pages/Profile";
import Appshell from "./components/layout/Appshell";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Appshell>
                <Dashboard />
              </Appshell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/paste"
          element={
            <ProtectedRoute>
              <Appshell>
                <PasteToTrack />
              </Appshell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <Appshell>
                <ResumeOptimizer />
              </Appshell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Appshell>
                <Profile />
              </Appshell>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;
