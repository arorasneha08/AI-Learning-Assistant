import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import mongoose from 'mongoose';
import fs from 'fs/promises';

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private

export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No file uploaded",
                statusCode: 400
            });
        }
        const { title } = req.body;
        if (!title) {
            await fs.unlink(req.file.path).catch(() => { });
            return res.status(400).json({
                success: false,
                error: "Title is required",
                statusCode: 400
            });
        }
        // const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const baseUrl = "https://cognify-wrpf.onrender.com/";
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;
        const document = await Document.create({
            title,
            userId: req.user._id,
            fileName: req.file.originalname,
            filePath: fileUrl,
            fileSize: req.file.size,
            status: "processing"
        });
        processPDF(document._id, req.file.path).catch((err) => {
            console.error("Error processing PDF:", err);
        });
        res.status(201).json({
            success: true,
            data: document,
            message: "Document uploaded successfully and is being processed",
            statusCode: 201
        });
    }
    catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { });
        }
        next(error);
    }
};

// helper function to process PDF and create flashcards and quizzes
const processPDF = async (documentId, filePath) => {
    try {
        const { text } = await extractTextFromPDF(filePath);
        const chunks = chunkText(text, 500, 50);
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: "ready"
        });
        console.log(`Document ${documentId} processed successfully with ${chunks.length} chunks.`);
    }
    catch (error) {
        console.error("Error in processPDF:", error);
        await Document.findByIdAndUpdate(documentId, { status: "failed" });
    }
}

// @desc    Get all user documents
// @route   GET /api/documents/:id
// @access  Private

export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
            {
                $lookup: {
                    from: "flashcards",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "flashcardSets"
                }
            },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "quizzes"
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: "$flashcardSets" },
                    quizCount: { $size: "$quizzes" }
                }
            },
            {
                $project : {
                    extractedText : 0 ,
                    chunks : 0 ,
                    flashcardSets : 0 , 
                    quizzes : 0 
                }
            }, 
            {
                $sort : {uploadDate : -1}
            }
        ])
        res.status(200).json({
            success: true,
            data: documents,
            count : documents.length,
            message: "Documents retrieved successfully",
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private

export const getDocumentById = async (req, res, next) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404
            });
        }
        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id , userId: req.user._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id , userId: req.user._id });
        document.lastAccessed = Date.now();
        await document.save();

        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;
        
        res.status(200).json({
            success: true,
            data: documentData,
            message: "Document retrieved successfully",
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    delete document
// @route   DELETE /api/documents/:id
// @access  Private

export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404
            });
        }
        await fs.unlink(document.filePath.replace("https://cognify-wrpf.onrender.com/", "")).catch(() => { });

        res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    update document title 
// @route   PUT /api/documents/:id
// @access  Private

// export const updateDocument = async (req, res, next) => {
//     try {
//     }
//     catch (error) {
//         if (req.file) {
//             await fs.unlink(req.file.path).catch(() => { });
//         }
//         next(error);
//     }
// }; 