import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Resume from '../src/models/Resume.js';
import Match from '../src/models/Match.js';
import config from '../src/config.js';

dotenv.config();

const sampleResumes = [
  {
    fileName: 'john-doe-resume.pdf',
    text: `John Doe
Software Engineer

EXPERIENCE
Senior Full-Stack Developer | Tech Corp | 2020-Present
• Led development of microservices architecture serving 1M+ users
• Implemented CI/CD pipeline reducing deployment time by 60%
• Mentored team of 5 junior developers

Full-Stack Developer | StartupXYZ | 2018-2020
• Developed React-based dashboard with real-time analytics
• Built RESTful APIs using Node.js and Express
• Optimized database queries improving performance by 40%

SKILLS
JavaScript, TypeScript, React, Node.js, Python, Docker, AWS, MongoDB, PostgreSQL, Git`,
  },
  {
    fileName: 'jane-smith-resume.pdf',
    text: `Jane Smith
Data Scientist

EXPERIENCE
Senior Data Scientist | DataCo | 2019-Present
• Developed machine learning models improving prediction accuracy by 25%
• Led data pipeline architecture for processing 10TB+ daily
• Presented insights to C-level executives

Data Analyst | Analytics Inc | 2017-2019
• Created dashboards and reports using Python and Tableau
• Performed statistical analysis on customer behavior data
• Automated reporting processes saving 20 hours/week

SKILLS
Python, R, SQL, TensorFlow, PyTorch, Pandas, Scikit-learn, AWS, Docker, Git`,
  },
];

const sampleJobDescriptions = [
  `Full-Stack Developer Position

We're looking for an experienced Full-Stack Developer to join our growing team.

Requirements:
- 3+ years of experience with JavaScript/TypeScript
- Strong knowledge of React and Node.js
- Experience with cloud platforms (AWS, Azure, or GCP)
- Familiarity with Docker and Kubernetes
- Understanding of CI/CD practices
- Excellent communication skills

Nice to have:
- Experience with microservices architecture
- Knowledge of GraphQL
- Contributions to open-source projects`,
  
  `Senior Data Scientist

Join our data science team to build cutting-edge ML solutions.

Requirements:
- 5+ years of experience in data science or ML engineering
- Strong Python programming skills
- Experience with TensorFlow or PyTorch
- Knowledge of statistical analysis and A/B testing
- Experience with big data technologies (Spark, Hadoop)
- Cloud platform experience (AWS, GCP)

Nice to have:
- PhD in Computer Science, Statistics, or related field
- Experience with MLOps and model deployment
- Knowledge of NLP or computer vision`,
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('✓ Connected');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Resume.deleteMany({});
    await Match.deleteMany({});
    console.log('✓ Cleared');
    
    // Create demo users
    console.log('Creating demo users...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const users = await User.create([
      {
        email: 'demo@example.com',
        password: hashedPassword,
        name: 'Demo User',
      },
      {
        email: 'hr@example.com',
        password: hashedPassword,
        name: 'HR Manager',
        role: 'hr',
      },
    ]);
    
    console.log(`✓ Created ${users.length} users`);
    
    // Create sample resumes with mock embeddings
    console.log('Creating sample resumes...');
    const resumes = [];
    
    for (let i = 0; i < sampleResumes.length; i++) {
      const sample = sampleResumes[i];
      const user = users[i % users.length];
      
      // Create mock chunks with embeddings
      const chunks = sample.text.split('\n\n').map((text, index) => ({
        text: text.trim(),
        tokens: Math.ceil(text.length / 4),
        embedding: Array(1536).fill(0).map(() => Math.random() * 2 - 1),
        metadata: { chunkIndex: index },
      }));
      
      const resume = await Resume.create({
        userId: user._id,
        fileName: sample.fileName,
        fileType: 'application/pdf',
        fileSize: 50000 + Math.random() * 50000,
        text: sample.text,
        chunks,
      });
      
      resumes.push(resume);
    }
    
    console.log(`✓ Created ${resumes.length} resumes`);
    
    // Create sample matches
    console.log('Creating sample matches...');
    const matches = [];
    
    for (let i = 0; i < resumes.length; i++) {
      const resume = resumes[i];
      const jobDesc = sampleJobDescriptions[i % sampleJobDescriptions.length];
      
      const match = await Match.create({
        userId: resume.userId,
        resumeId: resume._id,
        jobDescription: jobDesc,
        score: 70 + Math.floor(Math.random() * 25),
        breakdown: {
          skills: 75 + Math.floor(Math.random() * 20),
          experience: 70 + Math.floor(Math.random() * 20),
          keywords: 65 + Math.floor(Math.random() * 25),
        },
        missingSkills: ['Kubernetes', 'GraphQL', 'Terraform'],
        strengths: [
          'Strong technical background',
          'Relevant industry experience',
          'Good communication skills',
        ],
        weaknesses: [
          'Limited cloud platform experience',
          'No mention of specific certifications',
        ],
        explanation: 'Strong candidate with relevant experience. Would benefit from additional cloud certifications and Kubernetes experience.',
        tailoredBullets: [
          'Led development of scalable microservices architecture using Docker and Kubernetes, serving 1M+ users',
          'Implemented comprehensive CI/CD pipeline with automated testing, reducing deployment time by 60%',
          'Architected cloud-native solutions on AWS, optimizing costs by 30% while improving performance',
        ],
        originalBullets: [
          'Led development of microservices architecture serving 1M+ users',
          'Implemented CI/CD pipeline reducing deployment time by 60%',
        ],
        atsWarnings: [
          'Missing some key job description keywords',
          'Consider adding more specific technology versions',
        ],
        atsRecommendations: [
          'Add "Kubernetes" and "GraphQL" to skills section',
          'Include specific AWS services used (EC2, S3, Lambda, etc.)',
          'Quantify more achievements with metrics',
        ],
        passesATS: true,
      });
      
      matches.push(match);
    }
    
    console.log(`✓ Created ${matches.length} matches`);
    
    console.log('\n=== Seed Complete ===');
    console.log('\nDemo Accounts:');
    console.log('Email: demo@example.com');
    console.log('Email: hr@example.com');
    console.log('Password: demo123');
    console.log('\nYou can now login and explore the application!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
