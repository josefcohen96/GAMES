import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../socket";

interface GameState {
  status: string;
  letter: string | null;
  categories: string[];
  answers: { [playerId: string]: { [category: string]: string } };
  scores: { [playerId: string]: number } | null;
  players: string[];
}

export default function EratzIrGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const [letter, setLetter] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState<string>("waiting");
  const [scores, setScores] = useState<{ [playerId: string]: number } | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const socket = getSocket();

  const fetchState = () => {
    socket.emit("gameAction", {
      roomId,
      gameType: "eratz-ir",
      action: "state",
      isStarted: false,
    });
  };

  const startGame = () => {
    socket.emit("gameAction", {
      roomId,
      gameType: "eratz-ir",
      action: "start",
      payload: {},
    });
  };

  const submitAnswers = () => {
    socket.emit("gameAction", {
      roomId,
      gameType: "eratz-ir",
      action: "save",
      payload: { answers },
    });
  };

  const handleAnswerChange = (cat: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [cat]: value }));
  };

  useEffect(() => {
    fetchState();

    socket.on("gameStateUpdate", (data: GameState) => {
      console.log("📢 עדכון משחק:", data);
      setStatus(data.status);
      setLetter(data.letter);
      setCategories(data.categories);
      setScores(data.scores);
      setPlayers(data.players);
      setLoading(false);
    });

    return () => {
      socket.off("gameStateUpdate");
    };
  }, [roomId]);

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🎮 ארץ עיר</h2>
      {loading && <p className="text-center text-gray-500">טוען...</p>}

      <div className="mb-4 text-center">
        <p className="text-lg">שחקנים בחדר: {players.length}/2</p>
        <p className="text-gray-600">{players.join(", ")}</p>
      </div>

      {players.length < 2 ? (
        <p className="text-center text-yellow-600 font-semibold">
          ממתין לשחקן נוסף כדי להתחיל...
        </p>
      ) : status === "waiting" ? (
        <div className="text-center">
          <button
            onClick={startGame}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            התחל משחק
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <p>האות: <b>{letter}</b></p>
            <p>מצב: {status}</p>
          </div>

          {status === "playing" && (
            <>
              {categories.map((cat) => (
                <div key={cat} className="flex justify-between mb-2">
                  <label>{cat}</label>
                  <input
                    type="text"
                    value={answers[cat] || ""}
                    onChange={(e) => handleAnswerChange(cat, e.target.value)}
                    className="border rounded px-2 py-1 w-2/3"
                  />
                </div>
              ))}
              <button
                onClick={submitAnswers}
                className="bg-green-600 text-white px-4 py-2 rounded mt-3"
              >
                שלח תשובות
              </button>
            </>
          )}

          {scores && (
            <div className="mt-4 bg-gray-100 p-3 rounded">
              <h3>ניקוד:</h3>
              {Object.entries(scores).map(([player, score]) => (
                <p key={player}>{player}: {score} נק'</p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
