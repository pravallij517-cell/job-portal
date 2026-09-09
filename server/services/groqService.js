import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'groq/compound-mini'; // Updated: llama-3.1-8b-instant was removed

const buildGroqRequest = (prompt) => ({
  model: GROQ_MODEL,
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.2,
  max_tokens: 1000,
});

const callGroq = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Groq API key is not configured.');
  }

  const response = await axios.post(
    GROQ_API_URL,
    buildGroqRequest(prompt),
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const content = response?.data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Invalid response received from Groq API.');
  }

  return content;
};

const parseJsonResponse = (rawText) => {
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('Malformed JSON response from Groq API.');
    }
    return JSON.parse(match[0]);
  }
};

export const analyzeResumeWithGroq = async (resumeText) => {
  const prompt = `Analyze this resume and return valid JSON only with this exact structure:
{
  "name": "",
  "skills": [],
  "education": [],
  "experience": [],
  "jobTitles": [],
  "keywords": []
}

Resume content:
${resumeText}`;

  const text = await callGroq(prompt);
  return parseJsonResponse(text);
};

export const matchJobWithGroq = async (candidateProfile, jobInfo) => {
  const prompt = `Compare this candidate profile with this job. Return valid JSON only with this exact structure:
{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "explanation": ""
}

Candidate profile:
${JSON.stringify(candidateProfile, null, 2)}

Job information:
${JSON.stringify(jobInfo, null, 2)}`;

  const text = await callGroq(prompt);
  return parseJsonResponse(text);
};

export const rankCandidatesWithGroq = async (candidates, job) => {
  const prompt = `Rank these candidates for this job using the job requirements and each candidate's resumeScore. Treat resumeScore as an existing resume-screening signal, then adjust it based on required skills, experience, education, and job description. Return valid JSON only in array form where each item contains: {"userId":"","matchScore":0,"reason":""}. Job: ${JSON.stringify(job, null, 2)} Candidates: ${JSON.stringify(candidates, null, 2)}`;

  const text = await callGroq(prompt);
  const parsed = parseJsonResponse(text);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  return [];
};

export default { analyzeResumeWithGroq, matchJobWithGroq, rankCandidatesWithGroq };
