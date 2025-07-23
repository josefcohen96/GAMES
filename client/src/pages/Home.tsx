import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { initSocket, getSocket } from "../socket";

interface Room {
  id: string;
  name: string;
  gameType: string;
  maxPlayers: number;
  isStarted: boolean;
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [gameType, setGameType] = useState("eratz-ir");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const navigate = useNavigate();

  useEffect(() => {
    initSocket();
    const socket = getSocket();

    socket.on("roomUpdate", (data) => {
      console.log("📢 עדכון חדרים:", data);
      fetchRooms(); 
    });

    return () => {
      socket.off("roomUpdate");
    };
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/room");
      setRooms(res.data);
    } catch (error) {
      console.error("שגיאה בטעינת חדרים:", error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    try {
      const res = await api.post("/room", {
        name: newRoomName,
        gameType,
        maxPlayers,
      });
      const createdRoom = res.data;

      getSocket().emit("joinRoom", { roomId: createdRoom.id });

      setShowModal(false);
      setNewRoomName("");
      fetchRooms();

      navigate(`/games/${gameType}/${createdRoom.id}`);
    } catch (error) {
      console.error("שגיאה ביצירת חדר:", error);
    }
  };

  const joinRoom = (roomId: string, gameType: string) => {
    getSocket().emit("joinRoom", { roomId });
    navigate(`/games/${gameType}/${roomId}`);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🎮 רשימת חדרים</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          צור חדר חדש
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">טוען חדרים...</p>
      ) : rooms.length === 0 ? (
        <p className="text-gray-500">אין חדרים זמינים כרגע.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white shadow-md rounded p-4 flex flex-col justify-between"
            >
              <h2 className="text-xl font-bold">{room.name}</h2>
              <p className="text-gray-600">משחק: {room.gameType}</p>
              <p className="text-gray-600">מקס שחקנים: {room.maxPlayers}</p>
              <p className="text-gray-600">
                סטטוס: {room.isStarted ? "מתחיל" : "ממתין"}
              </p>
              <button
                onClick={() => joinRoom(room.id, room.gameType)}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                הצטרף
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded shadow-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">צור חדר חדש</h2>
            <input
              type="text"
              placeholder="שם החדר"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="border w-full p-2 rounded mb-3"
            />
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              className="border w-full p-2 rounded mb-3"
            >
              <option value="eratz-ir">ארץ עיר</option>
              <option value="war">מלחמה</option>
            </select>
            <input
              type="number"
              min={2}
              max={10}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="border w-full p-2 rounded mb-3"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                ביטול
              </button>
              <button
                onClick={createRoom}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                צור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
