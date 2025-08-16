import { useEffect, useMemo, useRef, useState } from "react";
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
  const userId = useMemo(() => localStorage.getItem("userId") || "player1", []);

  const [types, setTypes] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [gameType, setGameType] = useState("vocabulary");
  const [level, setLevel] = useState("beginner");
  const [questionCount, setQuestionCount] = useState(5);

  const [state, setState] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | string[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // local countdown (derived from server state once per round)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

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
      if (data.types?.length && !data.types.includes(gameType)) setGameType(data.types[0]);
      if (data.levels?.length && !data.levels.includes(level)) setLevel(data.levels[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const start = async () => {
    try {
      const startRes = await api.post(`/game/${roomId}/action`, {
        gameType: "english",
        action: "start",
        payload: {
          gameType,
          level,
          players: [userId],
          questionCount,
        },
      });
      setState(startRes.data);

      const roundRes = await api.post(`/game/${roomId}/action`, {
        gameType: "english",
        action: "startRound",
      });
      setState(roundRes.data);
      const q = roundRes.data.questions[roundRes.data.currentRound - 1];
      setCurrentQuestion(q);
      setSelected(null);
      hydrateTimerFromState(roundRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const hydrateTimerFromState = (st: any) => {
    const t = st?.players?.[userId]?.timeRemaining;
    setTimeLeft(typeof t === "number" ? t : null);
  };

  // client-side countdown for nicer UX
  useEffect(() => {
    if (timeLeft == null) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  const submit = async () => {
    if (!currentQuestion || selected == null) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/game/${roomId}/action`, {
        gameType: "english",
        action: "submitAnswer",
        payload: {
          playerId: userId,
          questionId: currentQuestion.id,
          answer: selected,
        },
      });
      setState(res.data);
      const next = res.data.questions[res.data.currentRound - 1];
      setCurrentQuestion(next || null);
      setSelected(next?.options?.length ? null : "");
      hydrateTimerFromState(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const onToggleOption = (opt: string) => {
    // Keep single-select for now. If you want multi, switch this block.
    setSelected(opt);
  };

  const Progress = () => {
    if (!state?.totalRounds) return null;
    const currentIdx = Math.min(Math.max((state.currentRound || 1) - 1, 0), state.totalRounds);
    const pct = Math.round((currentIdx / state.totalRounds) * 100);
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>Question {Math.min(state.currentRound, state.totalRounds)} / {state.totalRounds}</div>
          <div>{pct}%</div>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded">
          <div className="h-2 rounded bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  const Header = () => (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-bold">English Game</h2>
      {state && (
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">{state.gameType || gameType}</span>
          <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">{state.level || level}</span>
          <span className="px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">{currentQuestion?.points ?? 0} pts</span>
          {timeLeft != null && (
            <span className={`px-2 py-1 rounded-full border ${timeLeft <= 5 ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {timeLeft}s
            </span>
          )}
        </div>
      )}
    </div>
  );

  const StartForm = () => (
    <div className="grid gap-4 md:grid-cols-3 mt-4">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Type</label>
        <select value={gameType} onChange={(e) => setGameType(e.target.value)} className="border rounded px-3 py-2">
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Level</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="border rounded px-3 py-2">
          {levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">Questions</label>
        <input type="number" min={1} max={20} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="border rounded px-3 py-2" />
      </div>
      <div className="md:col-span-3">
        <button onClick={start} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow">Start Game</button>
      </div>
    </div>
  );

  const QuestionCard = () => (
    <div className="mt-6">
      <div className="p-4 rounded-lg border bg-gradient-to-b from-white to-gray-50 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="text-lg font-semibold">{currentQuestion?.question}</div>
          <div className="text-sm text-gray-500">{currentQuestion?.points} pts</div>
        </div>
        {/* Options or input */}
        {currentQuestion?.options?.length ? (
          <div className="mt-4 grid gap-2">
            {currentQuestion.options.map((opt) => {
              const active = selected === opt;
              return (
                <button
                  key={opt}
                  onClick={() => onToggleOption(opt)}
                  className={`text-left px-4 py-2 rounded border transition ${active ? "bg-green-600 text-white border-green-600" : "bg-white hover:bg-green-50 border-gray-200"}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <label className="text-sm text-gray-600">Your Answer</label>
            <input
              type="text"
              className="mt-1 w-full border rounded px-3 py-2"
              value={(typeof selected === "string" || selected == null) ? (selected || "") : ""}
              onChange={(e) => setSelected(e.target.value)}
              placeholder="Type your answer"
            />
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={submit}
            disabled={submitting || selected == null || (typeof selected === "string" && selected.trim() === "")}
            className={`px-5 py-2 rounded shadow text-white ${submitting || selected == null || (typeof selected === "string" && selected.trim() === "") ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {state?.currentRound >= state?.totalRounds ? "Finish" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );

  const formatAns = (ans: string | string[] | null | undefined) =>
    Array.isArray(ans) ? ans.join(", ") : (ans ?? "—");

  const isCorrect = (user: string | string[] | null | undefined, correct: string | string[]) => {
    if (user == null) return false;
    if (Array.isArray(correct)) {
      if (!Array.isArray(user)) return false;
      if (user.length !== correct.length) return false;
      return user.every((v, i) => v === correct[i]);
    }
    return user === correct;
  };

  const Results = () => {
    const scores: { playerId: string; score: number }[] = state?.finalScores
      ? Object.entries(state.finalScores).map(([playerId, score]) => ({ playerId, score: Number(score) }))
      : Object.entries(state?.players || {}).map(([playerId, p]: any) => ({ playerId, score: p.score }));
    const sorted = scores.sort((a, b) => b.score - a.score);

    const me = state?.players?.[userId];
    const questions: any[] = state?.questions || [];

    return (
      <div className="mt-6 p-4 rounded border bg-white shadow-sm">
        <h3 className="text-xl font-bold mb-3">Game Over</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="py-2 pr-4">Rank</th>
                <th className="py-2 pr-4">Player</th>
                <th className="py-2 pr-4">Score</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => (
                <tr key={row.playerId} className="border-t">
                  <td className="py-2 pr-4">{idx + 1}</td>
                  <td className="py-2 pr-4">{row.playerId}</td>
                  <td className="py-2 pr-4 font-semibold">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Review section */}
        {me && questions.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Review Answers</h4>
            <div className="space-y-3">
              {questions.map((q) => {
                const userAns = me.answers?.[q.id] as string | string[] | undefined;
                const correct = q.correctAnswer as string | string[];
                const ok = isCorrect(userAns, correct);
                return (
                  <div key={q.id} className={`p-4 rounded border ${ok ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{q.question}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
                        {ok ? "Correct" : "Incorrect"}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <div><span className="text-gray-600">Your answer:</span> <span className="font-medium">{formatAns(userAns)}</span></div>
                      <div><span className="text-gray-600">Correct answer:</span> <span className="font-medium">{formatAns(correct as any)}</span></div>
                      {q.explanation && (
                        <div className="mt-2 text-gray-700"><span className="text-gray-600">Explanation:</span> {q.explanation}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="rounded-xl border bg-white shadow">
        <div className="p-6 border-b bg-gray-50 rounded-t-xl">
          <Header />
          <Progress />
        </div>

        <div className="p-6">
          {!state || state.gameStatus === "waiting" ? <StartForm /> : null}

          {state && state.gameStatus === "playing" && currentQuestion && <QuestionCard />}

          {state && state.gameStatus === "finished" && <Results />}
        </div>
      </div>
    </div>
  );
}
