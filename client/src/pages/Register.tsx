import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log("Attempting to register with:", { username, password });
            await api.post("/auth/register", { username, password });
            navigate("/login"); 
        } catch (err) { 
            setError("שגיאה בהרשמה, ייתכן שהשם כבר קיים");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">הרשמה</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleRegister} className="space-y-4">
                <input
                    type="text"
                    placeholder="שם משתמש"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <input
                    type="password"
                    placeholder="סיסמה"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                    הרשם
                </button>
            </form>
            <p className="mt-4">
                יש לך כבר חשבון?{" "}
                <span
                    className="text-blue-600 cursor-pointer"
                    onClick={() => navigate("/login")}
                >
                    התחבר כאן
                </span>
            </p>
        </div>
    );
}
