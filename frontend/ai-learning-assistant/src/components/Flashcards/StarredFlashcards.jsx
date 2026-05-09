import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft} from "lucide-react";
import Flashcard from "../Flashcards/Flashcard";

const StarredFlashcardsPage = () => {
  const { state } = useLocation();
  const cards = state?.cards || [];

  const [currentIndex, setCurrentIndex] = useState(0);

  if (cards.length === 0) {
    return <p className="p-6">No starred cards found.</p>;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="p-6 space-y-8">
        <div className="mb-4">
        <Link
          to="/flashcards"
          className="inline-flex items-center gap-2  text-md text-neutral-600 hover:text-neutral-900 transition-colors "
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back to Flashcards
        </Link>
      </div>
      {/* Card */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <Flashcard flashcard={currentCard} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={handlePrev}
          disabled={cards.length <= 1}
          className="px-4 py-2 bg-slate-100 rounded-lg"
        >
          <ChevronLeft />
        </button>

        <span className="text-sm font-medium">
          {currentIndex + 1} / {cards.length}
        </span>

        <button
          onClick={handleNext}
          disabled={cards.length <= 1}
          className="px-4 py-2 bg-slate-100 rounded-lg"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default StarredFlashcardsPage;