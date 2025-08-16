import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

type Question = {
  id: string;
  question: string;
  options?: string[];
  points: number;
};

export default function EnglishGame() {
  const { roomId } = useParams();
  const [types, setTypes] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [gameType, setGameType] = useState("vocabulary");
  const [level, setLevel] = useState("beginner");
  const [questionCount, setQuestionCount] = useState(5);
  const [state, setState] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | string[] | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.post(`/game/${roomId}/action`, {
        gameType: "english",
        action: "options",
      });
      const data = res.data;
      setTypes(data.types || []);
      setLevels(data.levels || []);
    } catch (error) {
      console.error(error);
    }
  };

  const start = async () => {
    try {
      const res = await api.post(`/game/${roomId}/action`, {
        gameType: "english",
        action: "start",
        payload: {
          gameType,
          level,
          players: [localStorage.getItem("userId") || "player1"],
          questionCount,
        },
      });
      setState(res.data);
      // auto start round
      const r = await api.post(`/game/${roomId}/action`, {
        gameType: "english",
        action: "startRound",
      });
      setState(r.data);
      setCurrentQuestion(r.data.questions[r.data.currentRound - 1]);
    } catch (error) {
      console.error(error);
    }
  };

  const submit = async () => {
    if (!currentQuestion) return;
    try {
      const res = await api.post(`/game/${roomId}/action`, {
        gameType: "english",
        action: "submitAnswer",
        payload: {
          playerId: localStorage.getItem("userId") || "player1",
          questionId: currentQuestion.id,
          answer: selected,
        },
      });
      setState(res.data);
      // advance local question
      const next = res.data.questions[res.data.currentRound - 1];
      setCurrentQuestion(next || null);
      setSelected(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">English Game</h2>

      {!state || state.gameStatus === 'waiting' ? (
        <div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <select value={gameType} onChange={(e) => setGameType(e.target.value)} className="border p-2">
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="border p-2">
              {levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <input type="number" min={1} max={20} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="border p-2" />
          </div>
          <button onClick={start} className="bg-blue-600 text-white px-4 py-2 rounded">Start Game</button>
        </div>
      ) : null}

      {currentQuestion && (
        <div className="mt-6">
          <div className="text-lg font-semibold mb-2">{currentQuestion.question}</div>
          <div className="space-y-2">
            {(currentQuestion.options || []).map((opt) => (
              <div key={opt} className={`p-2 border rounded cursor-pointer ${selected === opt ? 'bg-green-100' : ''}`} onClick={() => setSelected(opt)}>
                {opt}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={submit} className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
          </div>
        </div>
      )}

      {state && state.gameStatus === 'finished' && (
        <div className="mt-6">
          <h3 className="text-xl font-bold">Game Over</h3>
          <pre className="bg-gray-100 p-2 mt-2">{JSON.stringify(state.finalScores || state.players, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
