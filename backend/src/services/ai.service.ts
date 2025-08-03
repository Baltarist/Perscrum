import { GoogleGenAI } from '@google/genai';
import prisma from '../config/database';
import { 
  AITaskSuggestionsRequest, 
  AIChatRequest, 
  AISubtaskSuggestionsRequest,
  CustomError,
  NotFoundError,
  ValidationError 
} from '../types';
import { AI_LIMITS } from '../config/constants';

/**
 * AI Service - Google Gemini Integration
 * Handles all AI-powered features including task suggestions, chat, and analytics
 */
export class AIService {
  private static ai: GoogleGenAI;

  /**
   * Initialize Google Gemini AI client
   */
  static initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required in environment variables');
    }

    this.ai = new GoogleGenAI({
      apiKey: apiKey
    });

    console.log('✅ Google Gemini AI initialized successfully');
  }

  /**
   * Check if user has exceeded their AI usage limits
   */
  private static async checkUsageLimits(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        aiUsageCount: true, 
        subscriptionTier: true,
        createdAt: true 
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const limits = AI_LIMITS[user.subscriptionTier];
    
    // For simplicity, we'll check daily limits based on aiUsageCount
    // In production, you'd want more sophisticated tracking
    if (limits.daily !== -1 && user.aiUsageCount >= limits.daily) {
      throw new CustomError(
        `AI usage limit exceeded. ${user.subscriptionTier} plan allows ${limits.daily} requests per day`,
        429
      );
    }
  }

  /**
   * Increment user's AI usage count
   */
  private static async incrementUsage(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { aiUsageCount: { increment: 1 } }
    });
  }

  /**
   * Generate AI-powered task suggestions for a project or sprint
   */
  static async generateTaskSuggestions(
    userId: string, 
    request: AITaskSuggestionsRequest
  ): Promise<{ suggestions: string[]; context: string }> {
    console.log('🤖 AI: Generating task suggestions for user:', userId);

    // Check usage limits
    await this.checkUsageLimits(userId);

    // Get project context
    let contextData = '';
    let projectTitle = '';
    
    if (request.projectId) {
      const project = await prisma.project.findFirst({
        where: { 
          id: request.projectId,
          OR: [
            { ownerId: userId },
            { teamMembers: { some: { userId } } }
          ]
        },
        include: {
          sprints: {
            where: request.sprintId ? { id: request.sprintId } : {},
            include: {
              tasks: {
                select: { title: true, description: true, status: true }
              }
            }
          }
        }
      });

      if (!project) {
        throw new NotFoundError('Project not found or access denied');
      }

      projectTitle = project.title;
      const sprintInfo = project.sprints.length > 0 ? project.sprints[0] : null;
      
      contextData = `
Project: ${project.title}
Description: ${project.description}
Total Sprints: ${project.totalSprints}
Sprint Duration: ${project.sprintDurationWeeks} weeks
${sprintInfo ? `
Current Sprint: ${sprintInfo.goal}
Existing Tasks: ${sprintInfo.tasks.map(t => `- ${t.title} (${t.status})`).join('\n')}
` : ''}
${request.context ? `Additional Context: ${request.context}` : ''}
      `.trim();
    }

    const prompt = `
You are an expert Scrum coach and project manager. Based on the following project information, suggest 5-8 specific, actionable tasks that would help achieve the project goals.

${contextData}

Requirements for task suggestions:
- Tasks should be specific and actionable
- Include a mix of planning, development, and review tasks
- Consider the current sprint context if provided
- Each task should be 1-2 sentences maximum
- Focus on deliverable outcomes
- Consider different skill levels within a team

Please provide task suggestions in a simple bullet-point format, one task per line, starting with "- ".
    `.trim();

    try {
      const result = await this.ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const responseText = result.text || '';
      
      // Parse the response to extract task suggestions
      const suggestions = responseText
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-'))
        .map((line: string) => line.replace(/^-\s*/, '').trim())
        .filter((task: string) => task.length > 10) // Filter out very short suggestions
        .slice(0, 8); // Limit to max 8 suggestions

      // Increment usage count
      await this.incrementUsage(userId);

      console.log(`✅ AI: Generated ${suggestions.length} task suggestions`);
      
      return {
        suggestions,
        context: `Generated for: ${projectTitle || 'General Project'}`
      };

    } catch (error) {
      console.error('❌ AI: Error generating task suggestions:', error);
      throw new CustomError('Failed to generate AI task suggestions', 500);
    }
  }

  /**
   * AI Chat functionality - coaching and project assistance
   */
  static async processChat(
    userId: string,
    request: AIChatRequest
  ): Promise<{ response: string; context: string }> {
    console.log('💬 AI: Processing chat message for user:', userId);

    // Check usage limits
    await this.checkUsageLimits(userId);

    // Get project and sprint context
    const project = await prisma.project.findFirst({
      where: { 
        id: request.projectId,
        OR: [
          { ownerId: userId },
          { teamMembers: { some: { userId } } }
        ]
      },
      include: {
        sprints: {
          where: request.sprintId ? { id: request.sprintId } : { status: 'active' },
          include: {
            tasks: {
              select: { title: true, description: true, status: true, storyPoints: true }
            }
          },
          take: 1
        }
      }
    });

    if (!project) {
      throw new NotFoundError('Project not found or access denied');
    }

    const activeSprint = project.sprints[0];
    const contextData = `
Project: ${project.title} - ${project.description}
${activeSprint ? `
Current Sprint: ${activeSprint.goal}
Sprint Status: ${activeSprint.status}
Tasks in Sprint: ${activeSprint.tasks.length}
Completed Tasks: ${activeSprint.tasks.filter(t => t.status === 'done').length}
In Progress: ${activeSprint.tasks.filter(t => t.status === 'in_progress').length}
` : 'No active sprint'}
    `.trim();

    const prompt = `
You are an experienced and friendly Scrum coach named "Koç". You help teams and individuals with Scrum methodology, project management, and productivity.

Current Project Context:
${contextData}

User Message: "${request.message}"

Guidelines for your response:
- Be helpful, encouraging, and professional
- Provide specific, actionable advice when possible
- Reference Scrum principles and best practices
- Keep responses concise but informative (2-4 sentences)
- If asked about project specifics, use the context provided
- Encourage good Scrum practices like daily standups, retrospectives, and sprint planning
- Be supportive and motivational

Respond as Koç, the AI Scrum coach:
    `.trim();

    try {
      const result = await this.ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const response = result.text || '';
      
      // Increment usage count
      await this.incrementUsage(userId);

      console.log('✅ AI: Generated chat response');
      
      return {
        response: response.trim(),
        context: `${project.title}${activeSprint ? ` - ${activeSprint.goal}` : ''}`
      };

    } catch (error) {
      console.error('❌ AI: Error processing chat:', error);
      throw new CustomError('Failed to process AI chat message', 500);
    }
  }

  /**
   * Generate subtask suggestions for a specific task
   */
  static async generateSubtaskSuggestions(
    userId: string,
    request: AISubtaskSuggestionsRequest
  ): Promise<{ suggestions: string[]; taskTitle: string }> {
    console.log('🔍 AI: Generating subtask suggestions for task:', request.taskId);

    // Check usage limits
    await this.checkUsageLimits(userId);

    // Get task context
    const task = await prisma.task.findFirst({
      where: { 
        id: request.taskId,
        sprint: {
          project: {
            OR: [
              { ownerId: userId },
              { teamMembers: { some: { userId } } }
            ]
          }
        }
      },
      include: {
        sprint: {
          include: {
            project: {
              select: { title: true, description: true }
            }
          }
        },
        subtasks: {
          select: { title: true, isCompleted: true }
        }
      }
    });

    if (!task) {
      throw new NotFoundError('Task not found or access denied');
    }

    const existingSubtasks = task.subtasks.map(st => st.title).join('\n- ');

    const prompt = `
You are a project management expert. Break down the following task into 3-6 specific, actionable subtasks.

Task Details:
Title: ${task.title}
Description: ${task.description || 'No description provided'}
Story Points: ${task.storyPoints || 'Not estimated'}
Status: ${task.status}
Project: ${task.sprint.project.title}

${existingSubtasks ? `Existing Subtasks:\n- ${existingSubtasks}` : 'No existing subtasks'}

Requirements for subtask breakdown:
- Create 3-6 specific, actionable subtasks
- Each subtask should be a clear, single action
- Subtasks should logically flow toward completing the main task
- Avoid duplicating existing subtasks
- Keep each subtask concise (1 line)
- Consider testing, documentation, and review steps when appropriate

Please provide subtasks in a simple bullet-point format, one per line, starting with "- ".
    `.trim();

    try {
      const result = await this.ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const responseText = result.text || '';
      
      // Parse the response to extract subtask suggestions
      const suggestions = responseText
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-'))
        .map((line: string) => line.replace(/^-\s*/, '').trim())
        .filter((subtask: string) => subtask.length > 5) // Filter out very short suggestions
        .slice(0, 6); // Limit to max 6 suggestions

      // Increment usage count
      await this.incrementUsage(userId);

      console.log(`✅ AI: Generated ${suggestions.length} subtask suggestions`);
      
      return {
        suggestions,
        taskTitle: task.title
      };

    } catch (error) {
      console.error('❌ AI: Error generating subtask suggestions:', error);
      throw new CustomError('Failed to generate AI subtask suggestions', 500);
    }
  }

  /**
   * Analyze sprint for retrospective insights
   */
  static async analyzeSprintRetrospective(
    userId: string,
    sprintId: string
  ): Promise<{ insights: string; recommendations: string[]; }> {
    console.log('📊 AI: Analyzing sprint retrospective for sprint:', sprintId);

    // Check usage limits
    await this.checkUsageLimits(userId);

    // Get sprint data
    const sprint = await prisma.sprint.findFirst({
      where: { 
        id: sprintId,
        project: {
          OR: [
            { ownerId: userId },
            { teamMembers: { some: { userId } } }
          ]
        }
      },
      include: {
        project: {
          select: { title: true, totalSprints: true, sprintDurationWeeks: true }
        },
        tasks: {
          include: {
            subtasks: true
          }
        }
      }
    });

    if (!sprint) {
      throw new NotFoundError('Sprint not found or access denied');
    }

    const totalTasks = sprint.tasks.length;
    const completedTasks = sprint.tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = sprint.tasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = sprint.tasks.filter(t => t.status === 'todo').length;
    const totalStoryPoints = sprint.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedStoryPoints = sprint.tasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const prompt = `
You are a Scrum coach analyzing a completed sprint. Provide insights and recommendations based on the sprint data.

Sprint Analysis Data:
Project: ${sprint.project.title}
Sprint: ${sprint.goal}
Sprint Number: ${sprint.sprintNumber} of ${sprint.project.totalSprints}
Sprint Duration: ${sprint.project.sprintDurationWeeks} weeks
Sprint Status: ${sprint.status}

Task Completion:
- Total Tasks: ${totalTasks}
- Completed: ${completedTasks} (${totalTasks > 0 ? Math.round(completedTasks/totalTasks*100) : 0}%)
- In Progress: ${inProgressTasks}
- Todo: ${todoTasks}

Story Points:
- Total Planned: ${totalStoryPoints}
- Completed: ${completedStoryPoints} (${totalStoryPoints > 0 ? Math.round(completedStoryPoints/totalStoryPoints*100) : 0}%)

Please provide:
1. A brief insight analysis (2-3 sentences about sprint performance)
2. 3-5 specific recommendations for improvement

Format your response as:
INSIGHTS: [Your analysis here]

RECOMMENDATIONS:
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]
    `.trim();

    try {
      const result = await this.ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const responseText = result.text || '';
      
      // Parse insights and recommendations
      const sections = responseText.split('RECOMMENDATIONS:');
      const insights = sections[0].replace('INSIGHTS:', '').trim();
      const recommendationsText = sections[1] || '';
      
      const recommendations = recommendationsText
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-'))
        .map((line: string) => line.replace(/^-\s*/, '').trim())
        .filter((rec: string) => rec.length > 10)
        .slice(0, 5);

      // Increment usage count
      await this.incrementUsage(userId);

      console.log('✅ AI: Generated sprint retrospective analysis');
      
      return {
        insights: insights || 'Sprint analysis completed.',
        recommendations: recommendations.length > 0 ? recommendations : [
          'Continue with current sprint practices',
          'Focus on completing tasks within the sprint timeframe',
          'Consider task estimation accuracy for future sprints'
        ]
      };

    } catch (error) {
      console.error('❌ AI: Error analyzing sprint retrospective:', error);
      throw new CustomError('Failed to analyze sprint retrospective', 500);
    }
  }

  /**
   * Get user's current AI usage statistics
   */
  static async getUsageStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        aiUsageCount: true, 
        subscriptionTier: true 
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const limits = AI_LIMITS[user.subscriptionTier];
    
    return {
      currentUsage: user.aiUsageCount,
      dailyLimit: limits.daily,
      monthlyLimit: limits.monthly,
      subscriptionTier: user.subscriptionTier,
      remainingToday: limits.daily === -1 ? -1 : Math.max(0, limits.daily - user.aiUsageCount)
    };
  }
}