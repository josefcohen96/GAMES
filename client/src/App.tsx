import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EratzIrGame from "./components/EratzIrGame";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { initSocket } from "./socket";
import WarGame from "./components/WarGame";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) initSocket();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/eratz-ir/:roomId"
              element={
                <ProtectedRoute>
                  <EratzIrGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/war/:roomId"
              element={
                <ProtectedRoute>
                  <WarGame />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
