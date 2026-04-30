import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import quizService from "../../services/quizService";
import aiService from "../../services/aIService";
import Spinner from "../common/Spinner";
import Button from "../common/Button";
import Modal from "../common/Modal";
import QuizCard from "./QuizCard";
import EmptyState from "../common/EmptyState";

const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizzes = async () => {
    setLoading(true);

    try {
      const data = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(data.data);
    } catch (error) {
      toast.error("Failed to fetch the quizzes");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchQuizzes();
  }, [documentId]);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId, { numQuestions });
      toast.success("Quiz generated successfully");
      setIsGeneratingModalOpen(false);
      fetchQuizzes();
    } catch (error) {
      toast.error("Failed to generate the quiz");
      console.log(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async() => {
    if(!selectedQuiz) return;
    setDeleting(true);
    try{
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success(`${selectedQuiz.title || 'Quiz'} deleted successfully`);
      setIsDeleteModalOpen(false); 
      setSelectedQuiz(null);
      setQuizzes(quizzes.filter(q => q._id !== selectedQuiz._id));
    }
    catch(error){
      toast.error("Failed to delete the quiz");
    }
    finally{
      setDeleting(false);
    }
  };

  const renderQuizContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (quizzes.length === 0) {
      return (
        <EmptyState
          title="No Quizzes Yet"
          description="Generate a quiz from your document to test you knowledge"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
  };
  return (
    <div className="bg-white border-neutral-200 rounded-lg p-6">
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => setIsGeneratingModalOpen(true)} className="cursor-pointer">
          <Plus size={16} />
          Generate Quiz
        </Button>
      </div>

      {renderQuizContent()}

      {/* generate quiz */}

      <Modal
        isOpen={isGeneratingModalOpen}
        onClose={() => setIsGeneratingModalOpen(false)}
        title="Generate New Quiz"
      >
        <form onSubmit={handleGenerateQuiz}>
          <div>
            <label
              className="block text-xs font-medium text-neutral-700 mb-1.5
                        "
            >
              Number of Questions{" "}
            </label>
            {/* <input className='w-full h-9 px-3 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent' type='number' value={numQuestions} onChange={(e) => setNumQuestions(Math.max(1 , parseInt(e.target.value) || 1))} min="1" required /> */}

            <input
              type="number"
              value={numQuestions}
              onChange={(e) => {
                const val = e.target.value;

                // allow empty input
                if (val === "") {
                  setNumQuestions("");
                  return;
                }

                setNumQuestions(parseInt(val));
              }}
              min="1"
              required
              className="w-full h-11 px-4 border border-neutral-300 rounded-xl bg-white text-sm text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsGeneratingModalOpen(false)}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={generating}>
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* delete confirmation */}
      <Modal isClose={() => setIsDeleteModalOpen(false)} isOpen={isDeleteModalOpen} title="Confirm Delete Quiz">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Are you sure you want to delete {" "}
            <span className="font-semibold text-neutral-900">{selectedQuiz?.title || "this quiz"} .</span>
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} disabled={deleting} className="bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500 cursor-pointer">
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default QuizManager;
