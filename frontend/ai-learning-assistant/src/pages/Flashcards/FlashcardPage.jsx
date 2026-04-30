import React , {useEffect , useState} from 'react'
import { useParams , Link} from 'react-router-dom'
import {ArrowLeft , Plus , ChevronLeft , ChevronRight, Trash2} from 'lucide-react'
import FlashcardService from '../../services/flashcardService';
import aiService from '../../services/aIService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Flashcard from '../../components/Flashcards/Flashcard';
import Modal from '../../components/common/Modal';

const FlashcardPage = () => {
  const {id :documentId} = useParams();
  const [flashcardSets , setFlashcardSets] = useState([]);
  const [flashcards , setFlashcards] = useState([]);
  const [loading , setLoading] = useState(false);
  const [generating , setGenerating] = useState(false);
  const [currentCardIndex , setCurrentCardIndex] = useState(0);
  const [deleting , setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchFlashcards = async() => {
    setLoading(true);
    try{
      const response = await FlashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data[0]); 
      setFlashcards(response.data[0]?.cards || [] );
    }
    catch(error){
      console.error('Error fetching flashcards:', error);
      console.log(error);
    }
    finally{
      setLoading(false);
    }
  }; 

  useEffect(() => {
    fetchFlashcards(); 
  } , [documentId]);

  const handleGenerateFlashcards = async() => {
    setGenerating(true);
    try{
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcards();
    }
    catch(error){
      console.error('Error generating flashcards:', error);
      toast.error("Failed to generate flashcards.");
    }
    finally{
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    handleReview(currentCardIndex); 
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleReview = async(index) => {
    const currentCard = flashcards[index];
    if(!currentCard) return;

    try{
      await FlashcardService.reviewFlashcard(currentCard._id , index);
      toast.success("Flashcard review status updated!");
    }
    catch(error){
      console.error('Error updating flashcard review status:', error);
      toast.error("Failed to update flashcard review status.");
    }
  };

  const handleToggleStar = async(cardId) => {
    try{
      await FlashcardService.toggleStar(cardId);
      setFlashcards((prevCards) => prevCards.map((card) => card._id === cardId ? {...card , isStarred : !card.isStarred} : card));
      toast.success("Flashcard starred status updated!");
    }
    catch(error){
      console.error('Error toggling flashcard star status:', error);
      toast.error("Failed to update flashcard starred status.");
    }
  };

  const handleDeleteFlashcardSet = async() => {
    setDeleting(true);
    try{
      await FlashcardService.deleteFlashcardSet(flashcardSets._id);
      toast.success("Flashcard set deleted successfully!");
      setIsDeleteModalOpen(false); 
      fetchFlashcards();
    }
    catch(error){
      console.error('Error deleting flashcard set:', error);
      toast.error("Failed to delete flashcard set.");
    }
    finally{
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if(loading){
      return <Spinner /> ; 
    }

    if(flashcards.length === 0){
      return <EmptyState title="No Flashcards" description="Generate Flashcards from your document to start learning" />
    };
    const currentCard = flashcards[currentCardIndex];
  
    return (
      <div className='flex flex-col items-center space-y-6'>
        <div className='w-full max-w-md'>
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar}/>
        </div>
        <div className='flex items-center gap-4'>
          <Button onClick={handlePrevCard} variant="secondary" disabled={flashcards.length <= 1}>
            <ChevronLeft size={16} /> Previous
          </Button>
          <span className='text-sm text-neutral-600'>{currentCardIndex + 1}/{flashcards.length}</span>
          <Button onClick={handleNextCard} variant="secondary" disabled={flashcards.length <= 1}>
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='mb-4'>
        <Link to={`/documents/${documentId}`} className='inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200'>
          <ArrowLeft size={16} /> Back to Document</Link>
      </div>
      <PageHeader title="Flashcards">
        <div className='flex gap-2'>
          {!loading && 
          (flashcards.length > 0 ? (
            <>
            <Button className='cursor-pointer' onClick={() => setIsDeleteModalOpen(true)} disabled={deleting}>
              <Trash2 size={16} /> Delete Set
            </Button>
            </>
          ) : (
            <Button onClick={handleGenerateFlashcards} disabled={generating}>
              {generating ? (
                <Spinner />
              ) : (
                <>
                <Plus size={16} /> Generate Flashcards 
                </>
              )}
            </Button>
          ))}
        </div>
      </PageHeader>

      {renderFlashcardContent()}

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Flashcard Set" >
        <div className='space-y-4' >
          <p className='text-sm text-neutral-600'>
            Are you sure you want to delete this flashcard set? This action cannot be undone.
          </p>
          <div className='flex justify-end gap-2 pt-2'>
            <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting} className='cursor-pointer'>
              Cancel 
            </Button>
            <Button className="bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500 cursor-pointer" onClick={handleDeleteFlashcardSet} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default FlashcardPage ; 
