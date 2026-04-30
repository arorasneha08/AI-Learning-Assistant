import {useState , useEffect} from 'react'
import FlashcardService from '../../services/flashcardService' ;
import PageHeader from '../../components/common/PageHeader' ;
import Spinner from '../../components/common/Spinner' ;
import toast from 'react-hot-toast' ;
import EmptyState from '../../components/common/EmptyState' ;
import FlashcardSetCard from '../../components/Flashcards/FlashcardSetCard';


const FlashcardListPage = () => {
  const [flashcardSets , setFlashcardSets] = useState([]) ;
  const [loading , setLoading] = useState(false) ;

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try{
        const response = await FlashcardService.getAllFlashcardSets() ;
        setFlashcardSets(response.data) ;
      }
      catch(error){
        toast.error("Failed to fetch flashcard sets") ;
        console.log(error);
      }
      finally{
        setLoading(false) ;
      }
    }
    fetchFlashcardSets() ;
  }, [])

  const renderContent = () => {
    if(loading){
      return <Spinner /> ;
    }
    if(flashcardSets.length === 0){
      return (
        <EmptyState title="No Flashcard Sets" description="You haven't created any flashcard sets yet. Start by creating a new set to help you learn!" />
      )
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4' >
        {flashcardSets.map((set) => {
          return <FlashcardSetCard key={set._id} flashcardSet={set} />
        })}
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="All Flashcard Sets" />
      {renderContent()}
    </div>
  )
}

export default FlashcardListPage
