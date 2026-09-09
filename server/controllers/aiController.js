import { analyzeResumeWithGroq, matchJobWithGroq, rankCandidatesWithGroq } from '../services/groqService.js';

export const analyzeResumeAi = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Resume text is required' });
    }

    const result = await analyzeResumeWithGroq(text);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message || 'AI analysis failed' });
  }
};

export const matchJobAi = async (req, res) => {
  try {
    const { candidateProfile, jobInfo } = req.body;
    if (!candidateProfile || !jobInfo) {
      return res.status(400).json({ message: 'Candidate profile and job info are required' });
    }

    const result = await matchJobWithGroq(candidateProfile, jobInfo);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Job matching failed' });
  }
};

export const rankCandidatesAi = async (req, res) => {
  try {
    const { candidates, job } = req.body;
    if (!Array.isArray(candidates) || !job) {
      return res.status(400).json({ message: 'Candidates array and job data are required' });
    }

    const result = await rankCandidatesWithGroq(candidates, job);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Candidate ranking failed' });
  }
};
