import * as aiService from '../services/aiService.js';

export const analyzeComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    const analysis = await aiService.analyzeComplaint(title, description);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const aiChat = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      });
    }

    const answer = await aiService.aiAssistant(question);

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
