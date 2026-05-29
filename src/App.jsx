import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PasteToTrack from "./pages/PasteToTrack";
import ResumeOptimizer from "./pages/ResumeOptimizer";
import Profile from "./pages/Profile";
import Appshell from "./components/layout/Appshell";

function App() {
  return (
    <Router>
    

      <Routes>
        <Route
          path="/"
          element={
            <Appshell>
              <Dashboard />
            </Appshell>
          }
        />
        <Route
          path="/paste"
          element={
            <Appshell>
              <PasteToTrack />
            </Appshell>
          }
        />
        <Route
          path="/resume"
          element={
            <Appshell>
              <ResumeOptimizer />
            </Appshell>
          }
        />
        <Route
          path="/profile"
          element={
            <Appshell>
              <Profile />
            </Appshell>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
