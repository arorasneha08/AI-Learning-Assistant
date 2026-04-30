import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import quizService from '../../services/quizService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const QuizzesTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuizById(quizId);
        setQuiz(res.data);
      } catch {
        toast.error("Failed to fetch quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleOptionChange = (qId, index) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: index }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(selectedAnswers).map(qId => {
        const q = quiz.questions.find(q => q._id === qId);
        return {
          questionIndex: quiz.questions.findIndex(q => q._id === qId),
          selectedAnswer: q.options[selectedAnswers[qId]]
        };
      });

      await quizService.submitQuiz(quizId, formattedAnswers);
      toast.success("Quiz submitted successfully");
      navigate(`/quizzes/${quizId}/results`);
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Spinner />
      </div>
    );
  }

  if (!quiz?.questions?.length) {
    return <p className="text-center mt-10 text-gray-600">No Quiz Found</p>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-1 px-4">

      <div className="max-w-3xl mx-auto">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} / {quiz.questions.length}</span>
            <span>{answeredCount} answered</span>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">

          {/* Question */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full mb-3">
              Question {currentQuestionIndex + 1}
            </span>

            <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedAnswers[currentQuestion._id] === i;

              return (
                <label
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200
                  ${isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  <div className={`w-5 h-5 flex items-center justify-center rounded-full border-2
                    ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}
                  `}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>

                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => handleOptionChange(currentQuestion._id, i)}
                    className="hidden"
                  />

                  <span className={`text-sm ${isSelected ? 'text-emerald-800 font-medium' : 'text-gray-700'}`}>
                    {opt}
                  </span>

                  {isSelected && (
                    <CheckCircle2 className="ml-auto w-5 h-5 text-emerald-500" />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
          >
            <ChevronLeft size={18} /> Previous
          </button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Question Index */}
        <div className="flex flex-wrap justify-center gap-2 ">
          {quiz.questions.map((q, i) => {
            const isAnswered = selectedAnswers.hasOwnProperty(q._id);
            const isCurrent = i === currentQuestionIndex;

            return (
              <button
                key={i}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all
                ${isCurrent
                    ? 'bg-emerald-500 text-white scale-110'
                    : isAnswered
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default QuizzesTakePage;