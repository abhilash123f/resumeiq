import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import User from '../src/models/User.js';
import Resume from '../src/models/Resume.js';
import Match from '../src/models/Match.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../src/config.js';

// Mock AI services to avoid real API calls in tests
jest.mock('../src/services/embeddingService.js', () => ({
  createEmbeddings: jest.fn((texts) => {
    return Promise.resolve(texts.map(() => Array(1536).fill(0).map(() => Math.random())));
  }),
}));

jest.mock('../src/services/llmService.js', () => ({
  callLLM: jest.fn((system, user, options) => {
    if (options?.responseFormat === 'json') {
      return Promise.resolve(JSON.stringify({
        score: 75,
        breakdown: { skills: 80, experience: 70, keywords: 75 },
        missingSkills: ['Docker', 'Kubernetes'],
        strengths: ['Strong JavaScript', 'Good communication'],
        weaknesses: ['Limited cloud experience'],
        explanation: 'Test explanation',
        rewrittenBullets: ['Test bullet 1', 'Test bullet 2'],
        passesATS: true,
        issues: [],
        recommendations: ['Add keywords'],
      }));
    }
    return Promise.resolve('Test response');
  }),
}));

describe('Match API', () => {
  let token;
  let userId;
  let resumeId;
  
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongodbUri);
    }
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Resume.deleteMany({});
    await Match.deleteMany({});
    
    // Create test user
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    });
    
    userId = user._id;
    
    // Generate token
    token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    // Create test resume
    const resume = await Resume.create({
      userId: user._id,
      fileName: 'test-resume.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      text: 'JavaScript developer with 5 years of experience in React and Node.js',
      chunks: [
        {
          text: 'JavaScript developer with React',
          tokens: 10,
          embedding: Array(1536).fill(0).map(() => Math.random()),
          metadata: { chunkIndex: 0 },
        },
        {
          text: '5 years of experience in Node.js',
          tokens: 10,
          embedding: Array(1536).fill(0).map(() => Math.random()),
          metadata: { chunkIndex: 1 },
        },
      ],
    });
    
    resumeId = resume._id;
  });
  
  describe('POST /api/match', () => {
    test('should create match analysis', async () => {
      const response = await request(app)
        .post('/api/match')
        .set('Authorization', `Bearer ${token}`)
        .send({
          resumeId: resumeId.toString(),
          jobDescription: 'Looking for a JavaScript developer with React experience and knowledge of Docker and Kubernetes.',
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Match analysis completed');
      expect(response.body.match).toBeDefined();
      expect(response.body.match.score).toBeGreaterThanOrEqual(0);
      expect(response.body.match.score).toBeLessThanOrEqual(100);
      expect(response.body.match.breakdown).toBeDefined();
      expect(response.body.match.missingSkills).toBeInstanceOf(Array);
      expect(response.body.match.tailoredBullets).toBeInstanceOf(Array);
    });
    
    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          resumeId: resumeId.toString(),
          jobDescription: 'Test job description',
        });
      
      expect(response.status).toBe(401);
    });
    
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/match')
        .set('Authorization', `Bearer ${token}`)
        .send({
          resumeId: resumeId.toString(),
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });
    
    test('should reject short job descriptions', async () => {
      const response = await request(app)
        .post('/api/match')
        .set('Authorization', `Bearer ${token}`)
        .send({
          resumeId: resumeId.toString(),
          jobDescription: 'Short',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('too short');
    });
    
    test('should reject invalid resume ID', async () => {
      const response = await request(app)
        .post('/api/match')
        .set('Authorization', `Bearer ${token}`)
        .send({
          resumeId: new mongoose.Types.ObjectId().toString(),
          jobDescription: 'Looking for a developer with at least 50 characters in this description.',
        });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });
  
  describe('GET /api/match/:id', () => {
    test('should get match by ID', async () => {
      // Create match first
      const match = await Match.create({
        userId,
        resumeId,
        jobDescription: 'Test job',
        score: 75,
        breakdown: { skills: 80, experience: 70, keywords: 75 },
        missingSkills: ['Docker'],
        strengths: ['JavaScript'],
        weaknesses: [],
        explanation: 'Test',
        tailoredBullets: [],
        originalBullets: [],
        atsWarnings: [],
        atsRecommendations: [],
      });
      
      const response = await request(app)
        .get(`/api/match/${match._id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.match).toBeDefined();
      expect(response.body.match.score).toBe(75);
    });
    
    test('should return 404 for non-existent match', async () => {
      const response = await request(app)
        .get(`/api/match/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/feedback', () => {
    test('should submit feedback', async () => {
      const match = await Match.create({
        userId,
        resumeId,
        jobDescription: 'Test job',
        score: 75,
        breakdown: { skills: 80, experience: 70, keywords: 75 },
        missingSkills: [],
        strengths: [],
        weaknesses: [],
        explanation: 'Test',
        tailoredBullets: [],
        originalBullets: [],
        atsWarnings: [],
        atsRecommendations: [],
      });
      
      const response = await request(app)
        .post('/api/match/feedback')
        .set('Authorization', `Bearer ${token}`)
        .send({
          matchId: match._id.toString(),
          rating: 5,
          comment: 'Great analysis!',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('submitted');
      
      // Verify feedback was saved
      const updatedMatch = await Match.findById(match._id);
      expect(updatedMatch.feedback.rating).toBe(5);
      expect(updatedMatch.feedback.comment).toBe('Great analysis!');
    });
  });
});
