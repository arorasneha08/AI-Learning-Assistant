import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import ChatHistory from '../models/ChatHistory.js';
import Quiz from '../models/Quiz.js';
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';

// @desc    Generate flashcards for a document
// @route   POST /api/ai/generate-flashcards
// @access  Private

export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Document id is required",
                statusCode: 400
            });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "ready"
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404
            });
        }
        const cards = await geminiService.generateFlashcards(document.extractedText, parseInt(count));
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                isStarred: false,
                reviewCount: 0
            }))
        });
        return res.status(200).json({
            success: true,
            data: flashcardSet,
            message: "Flashcards generated successfully"
        })
    }
    catch (error) {
        next(error);
    }
};

// @desc    Generate quiz for a document
// @route   POST /api/ai/generate-quiz
// @access  Private 

export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Document id is required",
                statusCode: 400
            });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "ready"
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404
            });
        }
        // generate quiz using gemini
        const questions = await geminiService.generateQuiz(document.extractedText, parseInt(numQuestions));
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid quiz data generated",
                statusCode: 400
            });
        }
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `Quiz for ${document.title}`,
            questions : questions, 
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });
        return res.status(200).json({
            success: true,
            data: quiz,
            message: "Quiz generated successfully"
        })
    }
    catch (error) {
        next(error);
    }
};

// @desc    Generate summary for a document
// @route   POST /api/ai/generate-summary
// @access  Private

export const generateSummary = async (req, res, next) => {
    try {
        const {documentId} = req.body;
        if(!documentId) {
            return res.status(400).json({
                success: false,
                error: "Document id is required",
                statusCode: 400
            });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "ready"
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404
            });
        }
        const summary = await geminiService.generateSummary(document.extractedText);
        return res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary ,
            },
            message: "Summary generated successfully"
        })
    }
    catch (error) {
        next(error);
    }
};

// @desc    Chat with AI about a document
// @route   POST /api/ai/chat
// @access  Private

export const chat = async (req, res, next) => {
    try {
        const {documentId , question} = req.body;
        if(!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: "Document id and question is required",
                statusCode: 400
            });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "ready"
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404
            });
        }
        const relevantChunks = findRelevantChunks(document.chunks , question , 3);
        const chunkIndices = relevantChunks.map(chunk => chunk.chunkIndex);

        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id
        }); 
        if(!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                chatHistory: []
            });
        }
        // generate response using gemini 

        const answer = await geminiService.chatWithContext(question , relevantChunks);
        chatHistory.messages.push({
            role : "user",
            content : question,
            timestamp : new Date(),
            relevantChunks : chunkIndices
        },
        {
            role : "assistant",
            content : answer,
            timestamp : new Date(),
            relevantChunks : chunkIndices
        });
        await chatHistory.save();
        return res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks : chunkIndices,
                chatHistoryId : chatHistory._id
            },
            message: "Response generated successfully"
        })
    }
    catch (error) {
        next(error);
    }
};

// @desc    Explain a concept from a document
// @route   POST /api/ai/explain-concept
// @access  Private 

export const explainConcept = async (req, res, next) => {
    try {
    }
    catch (error) {
        next(error);
    }
};

// @desc    Get chat history for a document
// @route   GET /api/ai/chat-history/:documentId
// @access  Private     

export const getChatHistory = async (req, res, next) => {
    try {
        
    }
    catch (error) {
        next(error);
    }
};
