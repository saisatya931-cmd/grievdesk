import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const groqClient = axios.create({
  baseURL: GROQ_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const categorizeComplaint = async (title, description) => {
  try {
    const prompt = `You are an expert at categorizing complaints in an educational institution. 
    
    Analyze the following complaint and categorize it into one of these categories:
    Academic, Examination, Faculty, Hostel, Canteen, Transport, Library, Infrastructure, Laboratory, Fees, Scholarship, IT/Technical, Administration, Other
    
    Complaint Title: ${title}
    Complaint Description: ${description}
    
    Respond with ONLY the category name, nothing else.`;

    const response = await groqClient.post('', {
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const category = response.data.choices[0].message.content.trim();
    return category;
  } catch (error) {
    console.error('Error categorizing complaint:', error.message);
    throw new Error('Failed to categorize complaint');
  }
};

export const detectPriority = async (title, description) => {
  try {
    const prompt = `You are an expert at assessing complaint severity in an educational institution.
    
    Analyze the following complaint and assess its priority level:
    Low - Minor issue, no immediate impact
    Medium - Standard issue, some impact
    High - Significant issue, serious impact
    Critical - Urgent issue, critical impact on students
    
    Complaint Title: ${title}
    Complaint Description: ${description}
    
    Respond with ONLY the priority level (Low, Medium, High, or Critical), nothing else.`;

    const response = await groqClient.post('', {
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 20,
    });

    const priority = response.data.choices[0].message.content.trim();
    return priority;
  } catch (error) {
    console.error('Error detecting priority:', error.message);
    throw new Error('Failed to detect priority');
  }
};

export const summarizeComplaint = async (title, description) => {
  try {
    const prompt = `Provide a concise one-line summary (max 15 words) of the following complaint:
    
    Title: ${title}
    Description: ${description}
    
    Summary:`;

    const response = await groqClient.post('', {
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const summary = response.data.choices[0].message.content.trim();
    return summary;
  } catch (error) {
    console.error('Error summarizing complaint:', error.message);
    throw new Error('Failed to summarize complaint');
  }
};

export const recommendDepartment = async (category, title, description) => {
  try {
    const departments = [
      'Academic Department',
      'Examination Department',
      'Faculty Department',
      'Hostel Administration',
      'Canteen Management',
      'Transport Department',
      'Library Administration',
      'Infrastructure Department',
      'Laboratory Administration',
      'Accounts Department',
      'Scholarship Office',
      'IT Support',
      'Administration Department',
    ];

    const prompt = `Based on the complaint category and details, recommend the best department to handle this complaint.
    
    Available Departments: ${departments.join(', ')}
    
    Complaint Category: ${category}
    Complaint Title: ${title}
    Complaint Description: ${description}
    
    Recommend ONLY one department name from the list above, nothing else.`;

    const response = await groqClient.post('', {
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const department = response.data.choices[0].message.content.trim();
    return department;
  } catch (error) {
    console.error('Error recommending department:', error.message);
    throw new Error('Failed to recommend department');
  }
};

// Heuristic fallbacks for offline or unconfigured AI states
const getFallbackCategory = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('exam') || text.includes('grade') || text.includes('hall ticket')) return 'Examination';
  if (text.includes('wifi') || text.includes('internet') || text.includes('portal') || text.includes('login') || text.includes('lab pc')) return 'IT/Technical';
  if (text.includes('hostel') || text.includes('room') || text.includes('warden') || text.includes('bed')) return 'Hostel';
  if (text.includes('food') || text.includes('canteen') || text.includes('mess') || text.includes('water')) return 'Canteen';
  if (text.includes('bus') || text.includes('transport') || text.includes('route')) return 'Transport';
  if (text.includes('book') || text.includes('library') || text.includes('journal')) return 'Library';
  if (text.includes('fee') || text.includes('payment') || text.includes('dues') || text.includes('receipt')) return 'Fees';
  if (text.includes('scholarship') || text.includes('stipend')) return 'Scholarship';
  if (text.includes('faculty') || text.includes('teacher') || text.includes('professor') || text.includes('attendance')) return 'Faculty';
  if (text.includes('fan') || text.includes('light') || text.includes('washroom') || text.includes('desk') || text.includes('ac') || text.includes('bench')) return 'Infrastructure';
  if (text.includes('lab') || text.includes('equipment') || text.includes('chemical')) return 'Laboratory';
  return 'Academic';
};

const getFallbackPriority = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('emergency') || text.includes('danger') || text.includes('electric shock') || text.includes('fire') || text.includes('critical') || text.includes('immediate')) return 'Critical';
  if (text.includes('urgent') || text.includes('exam tomorrow') || text.includes('deadline') || text.includes('severe')) return 'High';
  if (text.includes('minor') || text.includes('suggestion') || text.includes('low')) return 'Low';
  return 'Medium';
};

const getSmartFallbackAnswer = (question = '') => {
  const q = question.toLowerCase();
  if (q.includes('submit') || q.includes('create') || q.includes('file') || q.includes('lodge') || q.includes('new')) {
    return `To submit a complaint on GrievDesk:
1. Click **New Complaint** in the navigation bar or from your Dashboard.
2. Fill in the **Title** describing the core problem clearly.
3. Choose the appropriate **Category** (e.g., Academic, Hostel, IT/Technical).
4. Provide a detailed **Description** explaining when and where the problem occurred (at least 10 characters).
5. Specify the **Priority** and **Location** (e.g., Room 302, Library Block).
6. Optionally click **Analyze with AI** to auto-detect categories, and attach supporting evidence if needed.
7. Click **Submit Complaint** to register it directly in the system.`;
  }

  if (q.includes('status') || q.includes('meaning') || q.includes('review') || q.includes('progress') || q.includes('resolved')) {
    return `Here is what each complaint status means in GrievDesk:
• **Submitted**: Your complaint has been received and logged in the system.
• **Under Review**: An administrator is evaluating the complaint details and assigning the responsible team.
• **Assigned**: The issue has been delegated to the specific department head or officer.
• **In Progress**: Active work or inspection is underway to resolve the problem.
• **Resolved**: The department has fixed the issue and provided official resolution notes.
• **Closed**: Verified resolution finalized by the student or administrator.`;
  }

  if (q.includes('track') || q.includes('my complaint') || q.includes('check')) {
    return `To track your complaints in real time:
1. Go to **My Complaints** from the navbar or your dashboard quick-action bar.
2. Filter by status (Submitted, Under Review, In Progress, Resolved) or type your Complaint ID / keywords in the search bar.
3. Click on any complaint card to view its timeline history, administrator remarks, and department updates.`;
  }

  if (q.includes('category') || q.includes('which category') || q.includes('department')) {
    return `GrievDesk supports 14 standard institutional categories:
• **Academic & Faculty**: Course curriculum, timetable disputes, lecture scheduling, teacher assistance.
• **Examination**: Hall tickets, grade corrections, re-evaluation, exam hall conditions.
• **Hostel & Canteen**: Room repairs, hygiene, food quality, mess timings, water supply.
• **IT/Technical**: Campus Wi-Fi, portal access, lab computers, software licenses.
• **Infrastructure**: Classrooms, furniture, air conditioning, sanitation, power outages.
• **Fees & Scholarship**: Fee receipts, bank transfer confirmation, financial aid processing.
• **Library & Transport**: Book availability, digital catalog, bus schedules and route issues.`;
  }

  if (q.includes('how long') || q.includes('time') || q.includes('delay') || q.includes('urgent')) {
    return `Complaint resolution timelines vary by priority level:
• **Critical**: Reviewed within 2 to 4 hours (safety, health, immediate disruptions).
• **High**: 24 to 48 hours.
• **Medium**: 3 to 5 business days.
• **Low**: 5 to 7 business days.
You will receive updates directly in your notification center when status changes.`;
  }

  return `GrievDesk AI Assistant is here to help you navigate campus grievances. You can ask me about:
• How to file and format a complaint effectively
• What each status (Submitted, Under Review, In Progress, Resolved) means
• Which department handles specific complaints (Hostel, IT, Exams, Fees, Infrastructure)
• Expected resolution turnaround times and priority guidelines.`;
};

export const analyzeComplaint = async (title, description) => {
  try {
    const [category, priority, summary, recommendedDepartment] = await Promise.all([
      categorizeComplaint(title, description).catch(() => getFallbackCategory(title, description)),
      detectPriority(title, description).catch(() => getFallbackPriority(title, description)),
      summarizeComplaint(title, description).catch(() => title.slice(0, 80)),
      recommendDepartment('', title, description).catch(() => 'Administration Department'),
    ]);

    return {
      category: category || getFallbackCategory(title, description),
      priority: priority || getFallbackPriority(title, description),
      summary: summary || title.slice(0, 80),
      recommendedDepartment: recommendedDepartment || 'Administration Department',
    };
  } catch (error) {
    console.warn('Groq AI analyze failed, using heuristic analysis:', error.message);
    return {
      category: getFallbackCategory(title, description),
      priority: getFallbackPriority(title, description),
      summary: title.slice(0, 80),
      recommendedDepartment: 'Administration Department',
    };
  }
};

export const aiAssistant = async (question) => {
  try {
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) {
      const systemPrompt = `You are GrievDesk Assistant, a helpful AI assistant for a complaint management system in educational institutions. 
    
    You help students with questions about:
    - How to submit complaints
    - What complaint status means
    - How to track complaints
    - Which category to select
    - What information to provide
    
    Be concise, helpful, and accurate. Do not provide false information about complaint statuses or resolutions.`;

      const response = await groqClient.post('', {
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const answer = response.data.choices[0].message.content.trim();
      if (answer) {
        return answer;
      }
    }
  } catch (error) {
    console.warn('Error in Groq AI assistant, using institutional assistant fallback:', error.message);
  }

  return getSmartFallbackAnswer(question);
};
