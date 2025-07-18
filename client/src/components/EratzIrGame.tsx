import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

interface GameState {
  status: string;
  letter: string;
  categories: string[];
  answers: { [playerId: string]: { [category: string]: string } };
  scores: { [playerId: string]: number } | null;
  playersCount: number;
  players: string[];
}

export default function EratzIrGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const [letter, setLetter] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState<string>("");
  const [scores, setScores] = useState<{ [playerId: string]: number } | null>(null);
  const [playersCount, setPlayersCount] = useState<number>(0);
  const [players, setPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchState = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/game/${roomId}/action`, {
        gameType: "eratz-ir",
        action: "state"
      });
      console.log("מצב המשחק:", res.data);
      const data: GameState = res.data;
      setStatus(data.status);
      setLetter(data.letter);
      setCategories(data.categories);
      setScores(data.scores);
      setPlayersCount(data.players.length);
      setPlayers(data.players);
    } catch (error) {
      console.error("שגיאה בטעינת מצב המשחק:", error);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/game/${roomId}/action`, {
        gameType: "eratz-ir",
        action: "start",
        payload: {}
      });
      setLetter(res.data.letter);
      setCategories(res.data.categories);
      setStatus("playing");
    } catch (error) {
      console.error(error);
      alert("שגיאה בהתחלת המשחק");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (cat: string, value: string) => {
    setAnswers(prev => ({ ...prev, [cat]: value }));
  };

  const submitAnswers = async () => {
    try {
      setLoading(true);
      await api.post(`/game/${roomId}/action`, {
        gameType: "eratz-ir",
        action: "play",
        payload: {
          answers
        }
      });
      alert("תשובות נשלחו!");
      fetchState();
    } catch (error) {
      console.error(error);
      alert("שגיאה בשליחת תשובות");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, [roomId]);

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🎮 ארץ עיר</h2>

      {loading && <p className="text-center text-gray-500">טוען...</p>}

      {/* מצב חדר */}
      <div className="mb-4 text-center">
        <p className="text-lg">שחקנים בחדר: {playersCount}/2</p>
        <p className="text-gray-600">{players.join(", ")}</p>
      </div>

      {playersCount < 2 ? (
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
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg">האות: <span className="font-bold">{letter}</span></p>
            <p className="text-sm text-gray-500">מצב: {status}</p>
          </div>

          {scores && (
            <div className="mb-4 bg-gray-100 p-2 rounded">
              <h3 className="font-semibold mb-2">ניקוד:</h3>
              {Object.entries(scores).map(([player, score]) => (
                <p key={player}>{player}: {score} נק'</p>
              ))}
            </div>
          )}

          {status === "playing" && (
            <form className="space-y-3">
              {categories.map(cat => (
                <div key={cat} className="flex justify-between">
                  <label className="font-medium">{cat}</label>
                  <input
                    type="text"
                    value={answers[cat] || ""}
                    onChange={(e) => handleAnswerChange(cat, e.target.value)}
                    className="border rounded px-2 py-1 w-2/3"
                  />
                </div>
              ))}
            </form>
          )}

          <div className="mt-4 flex gap-3">
            {status === "playing" && (
              <button
                onClick={submitAnswers}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                שלח תשובות
              </button>
            )}
            <button
              onClick={fetchState}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              רענן מצב
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
