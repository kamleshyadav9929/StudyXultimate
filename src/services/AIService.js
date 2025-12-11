import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// OPENROUTER AI SERVICE - Powered by OpenRouter (Gemini 2.0 Flash)
// ============================================================================

// API Configuration
// You can set your API key in localStorage by running in console:
// localStorage.setItem('OPENROUTER_API_KEY', 'your-api-key-here')
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Models to try (in order of preference) - all free models
const MODELS = [
  'google/gemini-2.0-flash-lite-preview-02-05:free',
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3-8b-instruct:free',
  'microsoft/phi-3-medium-128k-instruct:free',
  'huggingfaceh4/zephyr-7b-beta:free',
  'mistralai/mistral-7b-instruct:free'
];

// System prompt that gives the AI context about the app
const getSystemPrompt = (appData) => {
  const subjects = appData?.subjects ? Object.values(appData.subjects).map(s => `${s.shortName} (${s.name})`).join(', ') : 'No subjects';
  
  // Calculate attendance
  let attendanceInfo = 'No attendance data';
  if (appData?.attendance) {
    const attendanceDetails = Object.entries(appData.attendance).map(([code, data]) => {
      const subj = appData.subjects?.[code];
      const percentage = data.total > 0 ? Math.round((data.attended / data.total) * 100) : 100;
      return `${subj?.shortName || code}: ${percentage}% (${data.attended}/${data.total})`;
    });
    attendanceInfo = attendanceDetails.join(', ');
  }

  // Get syllabus progress
  let syllabusInfo = 'No syllabus data';
  if (appData?.syllabus) {
    const progress = Object.entries(appData.syllabus).map(([code, modules]) => {
      const subj = appData.subjects?.[code];
      let total = 0, completed = 0;
      Object.values(modules).forEach(mod => {
        mod.topics?.forEach(t => {
          total++;
          if (t.status === 'completed') completed++;
        });
      });
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return `${subj?.shortName || code}: ${percent}%`;
    });
    syllabusInfo = progress.join(', ');
  }

  // Get tasks info
  let tasksInfo = 'No tasks';
  if (appData?.tasks && appData.tasks.length > 0) {
    const pending = appData.tasks.filter(t => t.status === 'pending');
    const overdue = pending.filter(t => t.dueDate && new Date(t.dueDate) < new Date());
    tasksInfo = `${pending.length} pending tasks, ${overdue.length} overdue`;
    if (pending.length > 0) {
      const taskList = pending.slice(0, 5).map(t => `- ${t.title}${t.dueDate ? ` (due: ${t.dueDate})` : ''}`).join('\n');
      tasksInfo += '\nRecent tasks:\n' + taskList;
    }
  }

  // Get goals info
  let goalsInfo = 'No goals set';
  if (appData?.goals && appData.goals.length > 0) {
    goalsInfo = appData.goals.map(g => {
      const daysLeft = Math.ceil((new Date(g.date) - new Date()) / (1000 * 60 * 60 * 24));
      return `${g.name} (${daysLeft > 0 ? daysLeft + ' days left' : 'past due'})`;
    }).join(', ');
  }

  // Get skills info
  let skillsInfo = 'No skills tracked';
  if (appData?.skills && appData.skills.length > 0) {
    skillsInfo = appData.skills.map(s => `${s.name}: Level ${s.level}/${s.maxLevel}`).join(', ');
  }

  return `You are StudyX AI, an intelligent study assistant built into the StudyX student dashboard app. You are helpful, encouraging, and knowledgeable about academics.

## YOUR CAPABILITIES:
- Answer questions about the student's subjects, syllabus, and academic content
- Provide study tips, explanations of concepts, and learning strategies
- Help with time management and study planning
- Motivate and encourage the student
- Explain complex topics in simple terms
- Create quizzes and practice questions
- Summarize chapters and topics
- Help with exam preparation

## STUDENT'S CURRENT DATA:
- **User**: ${appData?.userProfile?.name || 'Student'} (${appData?.userProfile?.semester || 'Semester'} at ${appData?.userProfile?.university || 'University'})
- **Goal**: ${appData?.userProfile?.goal || 'Not set'}
- **Subjects**: ${subjects}
- **Attendance**: ${attendanceInfo}
- **Syllabus Progress**: ${syllabusInfo}
- **Tasks**: ${tasksInfo}
- **Goals/Deadlines**: ${goalsInfo}
- **Skills**: ${skillsInfo}

## RESPONSE GUIDELINES:
1. **Be Concise & Direct**: Avoid fluff. Use short paragraphs and bullet points.
2. **Formatting**: Use Markdown headers (###), bold text, and code blocks.
3. **Academic Focus**: You are a student assistant. Prioritize academic accuracy.

## TOOL USE (ACTION CAPABILITIES):
You can modify the app's data directly when the user requests it. CURRENTLY, you can **Add Tasks** and **Add Goals**.
To use a tool, you MUST include a specific JSON block in your response. The app will parse this and execute the action.

### 1. Add Task
Trigger: When user says "remind me to..." or "add task..."
Syntax:
\`\`\`json
{
  "tool": "ADD_TASK",
  "args": {
    "title": "Task Title",
    "dueDate": "YYYY-MM-DD",
    "priority": "High" | "Medium" | "Low"
  }
}
\`\`\`

### 2. Add Goal
Trigger: When user says "my goal is..." or "add goal..."
Syntax:
\`\`\`json
{
  "tool": "ADD_GOAL",
  "args": {
    "name": "Goal Name",
    "deadline": "YYYY-MM-DD"
  }
}
\`\`\`

**IMPORTANT**: 
- You can include the JSON block anywhere in your response, but preferably at the end.
- You can add multiple tasks by including multiple JSON blocks.
- Always confirm to the user that you are performing the action (e.g., "I've added that task for you.").
`;
};

// ============================================================================
// AI SERVICE OBJECT
// ============================================================================

const AIService = {
  // Store app data reference for context
  _appData: null,

  // Set app data for context
  setAppData: (data) => {
    AIService._appData = data;
  },

  // Check if API key is configured
  isConfigured: () => {
    return Boolean(localStorage.getItem('OPENROUTER_API_KEY'));
  },

  // Get API key
  getApiKey: () => {
    return localStorage.getItem('OPENROUTER_API_KEY') || '';
  },

  // Set API key
  setApiKey: (key) => {
    if (key) {
      localStorage.setItem('OPENROUTER_API_KEY', key);
    } else {
      localStorage.removeItem('OPENROUTER_API_KEY');
    }
  },

  // Feature 1: Smart Study Assistant with OpenRouter API
  chat: async (message, conversationHistory = []) => {
    const apiKey = AIService.getApiKey();
    
    // If no API key, use fallback responses
    if (!apiKey) {
      return AIService._fallbackChat(message);
    }

    // Build messages array for OpenAI-compatible format
    const systemPrompt = getSystemPrompt(AIService._appData);
    
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Try each model in order
    let lastError = null;
    for (const model of MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin || 'http://localhost:5173',
            'X-Title': 'StudyX - Student Dashboard'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Model ${model} failed:`, data);
          // Check for rate limit or specific errors
          if (data.error && data.error.code === 429) {
             lastError = "Rate limit exceeded (429)";
          } else {
             lastError = data.error?.message || `API request failed (${response.status})`;
          }
          // Try next model
          continue;
        }

        const aiResponse = data.choices?.[0]?.message?.content;
        
        if (!aiResponse) {
          lastError = 'Empty response from model';
          continue;
        }

        return {
          id: uuidv4(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        console.error(`Model ${model} error:`, error);
        lastError = error.message;
        // Try next model
        continue;
      }
    }

    // All models failed
    console.error('All models failed. Last error:', lastError);
    return {
      id: uuidv4(),
      text: `⚠️ **Service Unavailable**\n\nI was unable to connect to any of the free AI models. Last error: _${lastError}_\n\n**Suggestions:**\n1. Check your internet connection.\n2. Verify your API key in Settings.\n3. Wait a moment and try again (providers may be busy).`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      isError: true
    };
  },

  // Fallback chat when no API key is available
  _fallbackChat: async (message) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerMsg = message.toLowerCase();
        let response = "🔑 To unlock my full AI capabilities, please add your OpenRouter API key in Settings! For now, I can help with basic queries.";

        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
          response = "Hello! 👋 I'm StudyX AI. To get the most out of me, please add your OpenRouter API key in Settings. I'll be able to help you with any study question!";
        } else if (lowerMsg.includes('api') || lowerMsg.includes('key')) {
          response = "🔑 To add your API key:\n1. Go to Settings (⚙️)\n2. Find 'AI Configuration'\n3. Enter your OpenRouter API key\n\nGet a key at: https://openrouter.ai/keys";
        } else if (lowerMsg.includes('help')) {
          response = "I can help you with:\n📚 Study explanations\n📅 Schedule planning\n✅ Task management\n🎯 Goal tracking\n💡 Study tips\n\nAdd your OpenRouter API key to unlock all features!";
        } else if (lowerMsg.includes('how are you')) {
          response = "I'm great! Ready to help you study! 📚 Add your API key in Settings to unlock my full potential.";
        }

        resolve({
          id: uuidv4(),
          text: response,
          sender: 'ai',
          timestamp: new Date().toISOString()
        });
      }, 500);
    });
  },

  // Feature 3: Intelligent Schedule Builder
  generateSchedule: (skills, tasks) => {
    const weakSkills = skills.filter(s => s.status === 'Weak' || s.level < 2);
    const urgentTasks = tasks.filter(t => !t.completed && t.status !== 'completed' && new Date(t.dueDate) <= new Date(Date.now() + 86400000 * 2));

    const suggestions = [];

    if (urgentTasks.length > 0) {
      suggestions.push({
        id: uuidv4(),
        title: `🔥 Finish: ${urgentTasks[0].title || urgentTasks[0].text}`,
        type: 'urgent',
        duration: '1 hour',
        reason: 'Due within 2 days!'
      });
    }

    if (weakSkills.length > 0) {
      suggestions.push({
        id: uuidv4(),
        title: `📖 Focus on: ${weakSkills[0].name}`,
        type: 'focus',
        duration: '45 mins',
        reason: 'Needs improvement'
      });
    } else {
      suggestions.push({
        id: uuidv4(),
        title: '📝 General Revision',
        type: 'routine',
        duration: '30 mins',
        reason: 'Keep your streak alive!'
      });
    }

    return suggestions;
  },

  // Feature 5: Predictive Analytics
  predictPerformance: (attendance, skills) => {
    let score = 70;

    const totalClasses = Object.values(attendance).reduce((acc, curr) => acc + curr.total, 0);
    const attendedClasses = Object.values(attendance).reduce((acc, curr) => acc + curr.attended, 0);
    const attendanceRate = totalClasses > 0 ? attendedClasses / totalClasses : 1;
    
    if (attendanceRate > 0.9) score += 10;
    else if (attendanceRate < 0.75) score -= 10;

    const strongSkills = skills.filter(s => s.status === 'Strong' || s.level >= 4).length;
    const weakSkills = skills.filter(s => s.status === 'Weak' || s.level <= 1).length;

    score += (strongSkills * 2);
    score -= (weakSkills * 2);

    score = Math.min(Math.max(score, 0), 99);

    let insight = "You're doing okay, but consistency is key.";
    if (score >= 90) insight = "🌟 Outstanding! You're on track for top grades.";
    else if (score >= 80) insight = "💪 Great job! Keep pushing to reach the top.";
    else if (score < 60) insight = "⚠️ You might need to focus more on attendance and weak subjects.";

    return { score, insight };
  },

  // Generate study content for a specific topic
  generateStudyContent: async (topic, subject) => {
    const apiKey = AIService.getApiKey();
    
    if (!apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'StudyX - Student Dashboard'
        },
        body: JSON.stringify({
          model: MODELS[0],
          messages: [{
            role: 'user',
            content: `Create comprehensive study notes for the topic "${topic}" in the subject "${subject}". Include:
1. Key concepts and definitions
2. Important formulas or rules (if applicable)
3. Examples
4. Common exam questions
5. Quick revision points

Format with markdown for better readability.`
          }],
          temperature: 0.3,
          max_tokens: 2048
        }),
      });

      const data = await response.json();
      return {
        success: true,
        content: data.choices?.[0]?.message?.content || ''
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Generate quiz questions for a topic
  generateQuiz: async (topic, subject, numQuestions = 5) => {
    const apiKey = AIService.getApiKey();
    
    if (!apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'StudyX - Student Dashboard'
        },
        body: JSON.stringify({
          model: MODELS[0],
          messages: [{
            role: 'user',
            content: `Generate ${numQuestions} multiple choice questions for the topic "${topic}" in "${subject}". 

Return as JSON array with this format:
[
  {
    "question": "Question text",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correct": "A",
    "explanation": "Brief explanation of the answer"
  }
]

Only return valid JSON, no other text.`
          }],
          temperature: 0.5,
          max_tokens: 2048
        }),
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '[]';
      
      // Parse JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return {
          success: true,
          questions: JSON.parse(jsonMatch[0])
        };
      }
      
      return { success: false, error: 'Failed to parse quiz questions' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default AIService;
