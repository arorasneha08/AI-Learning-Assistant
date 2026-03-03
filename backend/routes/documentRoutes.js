import express from 'express';
import {uploadDocument , getDocuments , getDocumentById , updateDocument , deleteDocument} from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import upload from '../config/multer.js'; 

const router = express.Router();

router.use(protect); // Apply authentication middleware to all document routes

router.post('/upload' , upload.single('file') , uploadDocument);
router.get('/' , getDocuments);
router.get('/:id' , getDocumentById);
router.put('/:id' , updateDocument);
router.delete('/:id' , deleteDocument);

export default router;