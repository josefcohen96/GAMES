import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
        🎮 Game Portal
      </h1>

      {token && (
        <div className="flex gap-4 items-center">
          <Link to="/" className="hover:underline">בית</Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-700"
          >
            התנתק
          </button>
        </div>
      )}
    </nav>
  );
}
