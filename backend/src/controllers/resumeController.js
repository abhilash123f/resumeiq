import Resume from '../models/Resume.js';
import { parseResume } from '../services/parserService.js';
import { chunkText } from '../services/chunkService.js';
import { createEmbeddings } from '../services/embeddingService.js';
import fs from 'fs/promises';

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const userId = req.user.userId;
    const file = req.file;
    
    // Parse resume text
    const { text, metadata } = await parseResume(file.path, file.mimetype);
    
    if (!text || text.trim().length < 50) {
      await fs.unlink(file.path);
      return res.status(400).json({ error: 'Could not extract sufficient text from resume' });
    }
    
    // Chunk text
    const chunks = await chunkText(text);
    
    // Create embeddings for chunks
    const chunkTexts = chunks.map(c => c.text);
    const embeddings = await createEmbeddings(chunkTexts);
    
    // Add embeddings to chunks
    const chunksWithEmbeddings = chunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i],
    }));
    
    // Save to database
    const resume = await Resume.create({
      userId,
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      text,
      metadata,
      chunks: chunksWithEmbeddings,
    });
    
    res.status(201).json({
      message: 'Resume uploaded and processed successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        chunkCount: chunks.length,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    // Clean up file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    next(error);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const resume = await Resume.findOne({ _id: id, userId });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({ resume });
  } catch (error) {
    next(error);
  }
};

export const listResumes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const resumes = await Resume.find({ userId })
      .select('-text -chunks')
      .sort({ createdAt: -1 });
    
    res.json({ resumes });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const resume = await Resume.findOne({ _id: id, userId });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Delete file
    if (resume.filePath) {
      try {
        await fs.unlink(resume.filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    
    await Resume.findByIdAndDelete(id);
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
};
