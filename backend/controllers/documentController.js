import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import mongoose from 'mongoose';
import fs from 'fs/promises';

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private

export const uploadDocument = async (req, res, next) => {
    try {
    }
    catch (error) {
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// @desc    Get all user documents
// @route   GET /api/documents/:id
// @access  Private

export const getDocuments = async (req, res, next) => {
    try {
    }
    catch (error) {
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
}; 

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private

export const getDocumentById = async (req, res, next) => {
    try {
    }
    catch (error) {
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// @desc    delete document
// @route   DELETE /api/documents/:id
// @access  Private

export const deleteDocument = async (req, res, next) => {
    try {
    }
    catch (error) {
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// @desc    update document title 
// @route   PUT /api/documents/:id
// @access  Private

export const updateDocument = async (req, res, next) => {
    try {
    }
    catch (error) {
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
}; 