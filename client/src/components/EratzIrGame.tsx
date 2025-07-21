import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../socket";

interface GameState {
  status: string;
  letter: string | null;
  categories: string[];
  players: string[];
  currentRound: number;
  roundScores: { [playerId: string]: number };
  totalScores: { [playerId: string]: number };
}

export default function EratzIrGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const socket = getSocket();

  const startGame = () => {
    console.log("📤 שולח startGame =>", { roomId });
    socket.emit("startGame", { roomId });
    setIsSubmitted(false);
    setAnswers({});
  };

  const startRound = () => {
    console.log("📤 שולח startRound =>", { roomId });
    socket.emit("startRound", { roomId });
    setIsSubmitted(false);
    setAnswers({});
    setTimer(null);
  };

  const resetGame = () => {
    console.log("📤 שולח resetGame =>", { roomId });
    socket.emit("resetGame", { roomId });
    setIsSubmitted(false);
    setAnswers({});
    setTimer(null);
  };

  const submitAnswers = () => {
    if (isSubmitted) return;

    const allFilled = gameState?.categories.every(cat => answers[cat]?.trim() !== "");
    if (!allFilled) {
      alert("אנא מלא את כל התשובות לפני שליחה");
      return;
    }

    setIsSubmitted(true);
    console.log("📤 שולח saveAnswers =>", { roomId, answers });
    socket.emit("saveAnswers", { roomId, answers });

    if (!timerRef.current) {
      console.log("📤 שולח finishRoundWithTimer =>", { roomId });
      socket.emit("finishRoundWithTimer", { roomId });
    }
  };

  useEffect(() => {
    console.log("📤 שולח joinRoom =>", { roomId });
    socket.emit("joinRoom", { roomId });

    socket.on("gameStateUpdate", (data: GameState) => {
      console.log("📥 התקבל gameStateUpdate =>", data);
      if (!data || !data.status) return;
      setGameState(data);
    });

    socket.on("startCountdown", () => {
      console.log("📥 התקבל startCountdown");
      if (!timerRef.current) {
        setTimer(10);
        timerRef.current = window.setInterval(() => {
          setTimer((prev) => {
            if (prev && prev > 1) return prev - 1;
            clearInterval(timerRef.current!);
            timerRef.current = null;
            console.log("📤 טיימר הסתיים => שולח finishRoundWithTimer");
            socket.emit("finishRoundWithTimer", { roomId });
            return 0;
          });
        }, 1000);
      }
    });

    return () => {
      console.log("🧹 מנקה ליסטנרים");
      socket.off("gameStateUpdate");
      socket.off("startCountdown");
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomId]);

  if (!gameState) {
    console.log("⌛ מחכה לנתונים... מציג טוען");
    return <p>טוען...</p>;
  }

  console.log("📢 gameState:", gameState);
  const canStartGame = gameState.players.length >= 2;
  const allFilled = gameState.categories.every(cat => answers[cat]?.trim() !== "");

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        🎮 ארץ עיר - סיבוב {gameState.currentRound}
      </h2>

      <div className="text-center mb-4">
        <p><strong>שחקנים בחדר:</strong> {gameState.players.join(", ")}</p>
      </div>

      {gameState.status === "waiting" && (
        <div className="text-center">
          {canStartGame ? (
            <button onClick={startGame} className="bg-green-600 text-white px-4 py-2 rounded">
              התחל משחק
            </button>
          ) : (
            <p className="text-gray-600">ממתינים לשחקנים נוספים כדי להתחיל...</p>
          )}
        </div>
      )}

      {gameState.status === "in-progress" && (
        <div className="text-center">
          <h3 className="mb-2">ניקוד מצטבר:</h3>
          {Object.entries(gameState.totalScores).map(([player, score]) => (
            <p key={player}>{player}: {score} נק'</p>
          ))}
          <button onClick={startRound} className="bg-blue-600 text-white px-4 py-2 rounded mt-3">
            התחל סיבוב
          </button>
          <button onClick={resetGame} className="ml-3 bg-gray-600 text-white px-4 py-2 rounded">
            אפס משחק
          </button>
        </div>
      )}

      {gameState.status === "playing-round" && (
        <>
          {timer && <p className="text-center text-red-500 text-xl mb-4">⏳ {timer}s</p>}
          <p className="text-center mb-2">אות: <b>{gameState.letter}</b></p>
          {gameState.categories.map((cat) => (
            <div key={cat} className="flex justify-between mb-2">
              <label>{cat}</label>
              <input
                type="text"
                disabled={isSubmitted}
                value={answers[cat] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [cat]: e.target.value }))}
                className="border rounded px-2 py-1 w-2/3"
              />
            </div>
          ))}
          {!isSubmitted && (
            <button
              onClick={submitAnswers}
              disabled={!allFilled}
              className={`bg-green-600 text-white px-4 py-2 rounded mt-3 ${!allFilled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              שלח תשובות
            </button>
          )}
        </>
      )}

      {gameState.status === "ended" && (
        <>
          <h3 className="text-lg font-bold mb-2">תוצאות סיבוב:</h3>
          {Object.entries(gameState.roundScores).map(([player, score]) => (
            <p key={player}>{player}: {score} נק'</p>
          ))}
          <h3 className="text-lg font-bold mt-4">ניקוד מצטבר:</h3>
          {Object.entries(gameState.totalScores).map(([player, score]) => (
            <p key={player}>{player}: {score} נק'</p>
          ))}
          <div className="mt-4 flex justify-between">
            <button onClick={startRound} className="bg-blue-600 text-white px-4 py-2 rounded">
              סיבוב נוסף
            </button>
            <button onClick={resetGame} className="bg-gray-600 text-white px-4 py-2 rounded">
              איפוס משחק
            </button>
          </div>
        </>
      )}
    </div>
  );
}
