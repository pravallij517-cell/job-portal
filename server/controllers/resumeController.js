import fs from 'fs';
import path from 'path';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { analyzeResumeWithGroq } from '../services/groqService.js';

const toText = (value) => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  if (value.degree || value.institution) {
    return [value.degree, value.institution, value.duration].filter(Boolean).join(' - ');
  }

  if (value.role || value.description) {
    return [value.role, value.description].filter(Boolean).join(': ');
  }

  return Object.values(value).filter(Boolean).join(' - ').trim();
};

const normalizeList = (value) =>
  (Array.isArray(value) ? value : []).map(toText).filter(Boolean);

/**
 * Extract plain text from a resume file (PDF or DOCX).
 * pdf-parse v2 uses class-based API: new PDFParse({verbosity:0}).parse(buffer)
 * mammoth works the same across versions.
 */
const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    // Use internal lib path to bypass pdf-parse v1's ESM test-file bug
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  }

  if (ext === '.docx') {
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  }

  if (ext === '.doc') {
    // .doc is legacy binary format — strip non-printable chars as best-effort
    const raw = fs.readFileSync(filePath, 'latin1');
    return raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, ' ');
  }

  // Plain text fallback
  return fs.readFileSync(filePath, 'utf8');
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a valid resume file' });
    }

    const existing = await Resume.findOne({ userId: req.user._id });
    if (existing) {
      if (fs.existsSync(existing.filePath)) {
        fs.unlinkSync(existing.filePath);
      }
      await existing.deleteOne();
    }

    const filePath = req.file.path;
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      filePath,
      extractedSkills: [],
      education: [],
      experience: [],
      jobTitles: [],
      keywords: [],
    });

    const user = await User.findById(req.user._id);
    user.resume = resume._id;
    await user.save();

    res.status(201).json({ message: 'Resume uploaded successfully', resume });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Resume upload failed' });
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }
    res.json({ resume });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch resume' });
  }
};

export const analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Upload a resume before analysis' });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({
        message: 'Resume file not found on disk. Please re-upload your resume.',
      });
    }

    // Extract text from the uploaded file
    let text = '';
    try {
      text = await extractTextFromFile(resume.filePath);
    } catch (parseErr) {
      console.error('File parse error:', parseErr);
      return res.status(422).json({
        message: `Could not read resume content: ${parseErr.message}. Please ensure your PDF/DOCX contains selectable text (not a scanned image).`,
      });
    }

    if (!text || text.trim().length < 20) {
      return res.status(422).json({
        message:
          'Resume text is too short or could not be extracted. Please ensure the file is a text-based PDF or DOCX (not a scanned image).',
      });
    }

    // Truncate to avoid Groq token limits (first 6000 chars is plenty)
    const truncatedText = text.slice(0, 6000);

    const analysis = await analyzeResumeWithGroq(truncatedText);

    const skillList = normalizeList(analysis.skills);
    const educationList = normalizeList(analysis.education);
    const experienceList = normalizeList(analysis.experience);
    const jobTitles = normalizeList(analysis.jobTitles);
    const keywords = normalizeList(analysis.keywords);

    resume.extractedSkills = skillList;
    resume.education = educationList;
    resume.experience = experienceList;
    resume.jobTitles = jobTitles;
    resume.keywords = keywords;
    resume.aiAnalysis = analysis;
    await resume.save();

    const user = await User.findById(req.user._id);
    user.skills = skillList;
    user.education = educationList;
    user.experience = experienceList;
    await user.save();

    res.json({ message: 'Resume analyzed successfully', analysis, resume });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: error.message || 'Resume analysis failed' });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await resume.deleteOne();
    const user = await User.findById(req.user._id);
    user.resume = null;
    user.skills = [];
    user.education = [];
    user.experience = [];
    await user.save();

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Resume deletion failed' });
  }
};
