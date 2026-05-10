const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const analyzeIncident = async (incident, recentMetrics) => {
  const prompt = `You are a senior DevOps engineer analyzing a production incident.

Incident Details:
- Service: ${incident.service_name}
- Title: ${incident.title}
- Description: ${incident.description}
- Severity: ${incident.severity}
- Time: ${incident.created_at}

Recent Metrics (last 5 checks):
${recentMetrics.map(m => `- Status: ${m.status}, Response Time: ${m.response_time}ms, Error: ${m.error_message || 'none'}`).join('\n')}

Provide a concise incident analysis in this exact JSON format:
{
  "root_cause": "One sentence root cause",
  "impact": "One sentence business impact",
  "fix_suggestion": "2-3 specific actionable steps to fix",
  "prevention": "One sentence prevention measure"
}`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { root_cause: content, impact: '', fix_suggestion: '', prevention: '' };
  } catch (error) {
    console.error('Groq AI error:', error.message);
    return {
      root_cause: 'Service is experiencing connectivity issues',
      impact: 'Users may be unable to access this service',
      fix_suggestion: '1. Check service logs\n2. Verify network connectivity\n3. Restart the service',
      prevention: 'Implement circuit breaker pattern and health checks',
    };
  }
};

module.exports = { analyzeIncident };