import Flashcard from '../models/Flashcard.js';

// @desc    Get all flashcard sets for the authenticated user
// @route   GET /api/flashcards/:documentId
// @access  Private

export const getFlashcards = async (req, res , next) => {
    try {
        const flashcards = await Flashcard.find({ 
            userId: req.user._id, documentId: req.params.documentId 
        })
        .populate("documentId", "title fileName")
        .sort({ createdAt: -1 });

        res.status(200).json({
            success : true , 
            count : flashcards.length ,
            data : flashcards
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Get all flashcard sets for the authenticated user
// @route   GET /api/flashcards
// @access  Private

export const getAllFlashcardSets = async (req, res , next) => {
    try {
        const flashcardsSets = await Flashcard.find({ 
            userId : req.user._id, 
        })
        .populate("documentId", "title")
        .sort({ createdAt: -1 });

        res.status(200).json({
            success : true , 
            count : flashcardsSets.length ,
            data : flashcardsSets,
        });
    }
    catch (error) {
        next(error);
    }
}; 

// @desc    review flashcard
// @route   POST /api/flashcards/:cardId/review
// @access  Private

export const reviewFlashcard = async (req, res , next) => {
    try{
        const flashcardSet = await Flashcard.findOne({
            'cards._id' : req.params.cardId,
            userId : req.user._id
        });
        if(!flashcardSet){
            return res.status(404).json({ 
                success : false ,
                message: 'Flashcard not found' ,
                statusCode : 404
            });
        }
        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);
        if(cardIndex === -1){
            return res.status(404).json({ 
                success : false ,
                message: 'Flashcard not found' ,
                statusCode : 404
            });
        }
        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;
        await flashcardSet.save();

        res.status(200).json({
            success : true , 
            data : flashcardSet,
            message : 'Flashcard reviewed successfully'
        });
    }
    catch (error) {
        next(error);
    }   
};

// @desc    toggle star/favourite flashcard
// @route   PUT /api/flashcards/:cardId/star
// @access  Private

export const toggleStarFlashcard = async (req, res) => {
    try{
        const flashcardSet = await Flashcard.findOne({
            'cards._id' : req.params.cardId,
            userId : req.user._id
        }); 

        if(!flashcardSet){
            return res.status(404).json({ 
                success : false ,
                message: 'Flashcard not found' ,
                statusCode : 404
            });
        }
        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);
        if(cardIndex === -1){
            return res.status(404).json({ 
                success : false ,
                message: 'Flashcard not found' ,
                statusCode : 404
            });
        }
        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;
        await flashcardSet.save();
        res.status(200).json({
            success : true , 
            data : flashcardSet,
            message : flashcardSet.cards[cardIndex].isStarred ? 'Flashcard starred successfully' : 'Flashcard unstarred successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

// desc     delete flashcard set
// route    DELETE /api/flashcards/:id
// access   Private

export const deleteFlashcardSet = async (req, res) => {
    try{
        const flashcardSet = await Flashcard.findOne({
            _id : req.params.id,
            userId : req.user._id
        });
        if(!flashcardSet){
            return res.status(404).json({ 
                success : false ,
                message: 'Flashcard set not found' ,
                statusCode : 404
            });
        }
        await Flashcard.deleteOne({ _id : req.params.id, userId : req.user._id });
        res.status(200).json({
            success : true , 
            message : 'Flashcard set deleted successfully'
        });

    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getStarredFlashcards = async (req, res, next) => {
  try {
    const sets = await Flashcard.find({
      userId: req.user._id,
      "cards.isStarred": true,
    }).populate("documentId", "title");

    const starredCards = sets.flatMap((set) =>
      set.cards
        .filter((card) => card.isStarred)
        .map((card) => ({
          ...card.toObject(),
          documentTitle: set.documentId?.title,
          setId: set._id,
        }))
    );

    res.status(200).json({
      success: true,
      count: starredCards.length,
      data: starredCards,
    });
  } catch (error) {
    next(error);
  }
};