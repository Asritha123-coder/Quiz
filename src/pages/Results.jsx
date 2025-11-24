import { useLocation } from "react-router-dom";

export default function Results() {
  const { state } = useLocation();
  const { questions, userAnswers } = state;

  const getScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) score++;
    });
    return score;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
      <h2 className="text-xl mb-6">
        Score: {getScore()} / {questions.length}
      </h2>

      {questions.map((q, index) => {
        const userAns = userAnswers[index];
        const correctAns = q.correct_answer;
        const isCorrect = userAns === correctAns;

        return (
          <div key={index} className="mb-6 p-4 border rounded-xl bg-gray-50">
            <p className="font-semibold mb-2">
              {index + 1}. {q.question}
            </p>

            <p
              className={`p-2 rounded mb-2 
                ${isCorrect ? "bg-green-200" : "bg-red-200"}
              `}
            >
              <strong>Your Answer:</strong> {userAns}
            </p>

            {!isCorrect && (
              <p className="p-2 rounded bg-green-100 border border-green-300">
                <strong>Correct Answer:</strong> {correctAns}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
