import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import PasteToTrack from "./pages/PasteToTrack";
import Profile from "./pages/Profile";
import Appshell from "./components/layout/Appshell";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword.jsx";
import GetExtension from "./pages/GetExtension.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
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
          element={<Navigate to="/paste-to-track" replace />}
        />
        <Route
          path="/paste-to-track"
          element={
            <ProtectedRoute>
              <Appshell>
                <PasteToTrack />
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
        <Route
          path="/extension"
          element={
            <ProtectedRoute>
              <Appshell>
                <GetExtension />
              </Appshell>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
