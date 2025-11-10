/**
 * Utility functions for questionnaire/assessment handling
 */

import { UserResponse, QuestionBank, Assessment } from '@/types/models';

/**
 * Build a formatted string from answered questions for LLM milestone generation
 * Similar to how comprehensive questionnaire works
 */
export function buildQuestionnaireStringForLLM(
  responses: UserResponse[],
  questions: QuestionBank[],
  kidProfileName?: string,
  kidAge?: number
): string {
  // Create a map of questionId -> QuestionBank for quick lookup
  const questionMap = new Map<string, QuestionBank>();
  questions.forEach((q) => {
    if (q.id) {
      questionMap.set(q.id, q);
    }
  });

  // Build the string
  let result = '';

  // Add kid profile context if available
  if (kidProfileName || kidAge) {
    result += 'Child Profile:\n';
    if (kidProfileName) {
      result += `  Name: ${kidProfileName}\n`;
    }
    if (kidAge !== undefined) {
      result += `  Age: ${kidAge} months\n`;
    }
    result += '\n';
  }

  result += 'Questionnaire Responses:\n';
  result += '='.repeat(50) + '\n\n';

  // Group responses by category if available
  const responsesByCategory = new Map<string, UserResponse[]>();
  
  responses.forEach((response) => {
    if (response.questionId) {
      const question = questionMap.get(response.questionId);
      const category = question?.category || 'UNCATEGORIZED';
      
      if (!responsesByCategory.has(category)) {
        responsesByCategory.set(category, []);
      }
      responsesByCategory.get(category)!.push(response);
    }
  });

  // Build output by category
  responsesByCategory.forEach((categoryResponses, category) => {
    result += `Category: ${category}\n`;
    result += '-'.repeat(30) + '\n';

    categoryResponses.forEach((response) => {
      const question = response.questionId ? questionMap.get(response.questionId) : null;
      
      if (question) {
        result += `Q: ${question.question_text || 'Question'}\n`;
        result += `A: ${response.answer || 'No answer provided'}\n`;
        
        // Include score if available
        if (response.score !== undefined) {
          result += `Score: ${response.score}`;
          if (question.scoring?.maxScore) {
            result += ` / ${question.scoring.maxScore}`;
          }
          result += '\n';
        }
        
        result += '\n';
      }
    });

    result += '\n';
  });

  // Add summary statistics if scores are available
  const scoredResponses = responses.filter((r) => r.score !== undefined);
  if (scoredResponses.length > 0) {
    const totalScore = scoredResponses.reduce((sum, r) => sum + (r.score || 0), 0);
    const maxPossibleScore = scoredResponses.reduce((sum, r) => {
      const question = r.questionId ? questionMap.get(r.questionId) : null;
      return sum + (question?.scoring?.maxScore || 0);
    }, 0);

    result += 'Summary Statistics:\n';
    result += '-'.repeat(30) + '\n';
    result += `Total Questions Answered: ${responses.length}\n`;
    result += `Scored Questions: ${scoredResponses.length}\n`;
    if (maxPossibleScore > 0) {
      result += `Total Score: ${totalScore} / ${maxPossibleScore}\n`;
      result += `Percentage: ${((totalScore / maxPossibleScore) * 100).toFixed(1)}%\n`;
    }
    result += '\n';
  }

  return result;
}

/**
 * Calculate total score for an assessment
 */
export function calculateAssessmentScore(
  responses: UserResponse[],
  questions: QuestionBank[]
): { totalScore: number; maxScore: number; percentage: number } {
  const questionMap = new Map<string, QuestionBank>();
  questions.forEach((q) => {
    if (q.id) {
      questionMap.set(q.id, q);
    }
  });

  let totalScore = 0;
  let maxScore = 0;

  responses.forEach((response) => {
    if (response.questionId && response.score !== undefined) {
      totalScore += response.score;
      
      const question = questionMap.get(response.questionId);
      if (question?.scoring?.maxScore) {
        maxScore += question.scoring.maxScore;
      } else {
        // If no max score defined, use the response score as max
        maxScore += response.score;
      }
    }
  });

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return {
    totalScore,
    maxScore,
    percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
  };
}

/**
 * Calculate score for a single response based on question scoring configuration
 */
export function calculateResponseScore(
  answer: string,
  question: QuestionBank
): number {
  if (!question.scoring) {
    return 0; // No scoring configured
  }

  const { type, scoreMap, maxScore } = question.scoring;

  switch (type) {
    case 'binary':
      // Simple yes/no or true/false
      const normalizedAnswer = answer.trim().toLowerCase();
      if (normalizedAnswer === 'yes' || normalizedAnswer === 'true' || normalizedAnswer === '1') {
        return maxScore || 10;
      }
      return 0;

    case 'scale':
      // Numeric scale answer
      const numericAnswer = parseFloat(answer);
      if (!isNaN(numericAnswer)) {
        return Math.min(numericAnswer, maxScore || 10);
      }
      return 0;

    case 'weighted':
      // Use scoreMap to map answer values to scores
      if (scoreMap && scoreMap[answer]) {
        return scoreMap[answer];
      }
      // Fallback: try normalized answer
      const normalized = answer.trim().toLowerCase();
      for (const [key, value] of Object.entries(scoreMap || {})) {
        if (key.toLowerCase() === normalized) {
          return value;
        }
      }
      return 0;

    default:
      return 0;
  }
}

/**
 * Generate summary report for an assessment
 */
export function generateSummaryReport(
  assessment: Assessment,
  responses: UserResponse[],
  questions: QuestionBank[],
  kidProfileName?: string
): string {
  const { totalScore, maxScore, percentage } = calculateAssessmentScore(responses, questions);

  let report = '';
  report += '='.repeat(60) + '\n';
  report += 'ASSESSMENT SUMMARY REPORT\n';
  report += '='.repeat(60) + '\n\n';

  if (kidProfileName) {
    report += `Child: ${kidProfileName}\n`;
  }
  report += `Assessment Type: ${assessment.type || 'UNKNOWN'}\n`;
  if (assessment.completedAt) {
    report += `Completed: ${new Date(assessment.completedAt).toLocaleDateString()}\n`;
  }
  report += '\n';

  report += 'Overall Score:\n';
  report += `  Total: ${totalScore} / ${maxScore}\n`;
  report += `  Percentage: ${percentage.toFixed(1)}%\n`;
  report += '\n';

  // Category breakdown
  const questionMap = new Map<string, QuestionBank>();
  questions.forEach((q) => {
    if (q.id) {
      questionMap.set(q.id, q);
    }
  });

  const categoryScores = new Map<string, { score: number; max: number; count: number }>();

  responses.forEach((response) => {
    if (response.questionId && response.score !== undefined) {
      const question = questionMap.get(response.questionId);
      const category = question?.category || 'UNCATEGORIZED';
      
      if (!categoryScores.has(category)) {
        categoryScores.set(category, { score: 0, max: 0, count: 0 });
      }
      
      const catData = categoryScores.get(category)!;
      catData.score += response.score;
      catData.count += 1;
      
      if (question?.scoring?.maxScore) {
        catData.max += question.scoring.maxScore;
      }
    }
  });

  if (categoryScores.size > 0) {
    report += 'Category Breakdown:\n';
    report += '-'.repeat(40) + '\n';
    
    categoryScores.forEach((data, category) => {
      const catPercentage = data.max > 0 ? (data.score / data.max) * 100 : 0;
      report += `${category}:\n`;
      report += `  Score: ${data.score} / ${data.max}\n`;
      report += `  Percentage: ${catPercentage.toFixed(1)}%\n`;
      report += `  Questions: ${data.count}\n`;
      report += '\n';
    });
  }

  report += '='.repeat(60) + '\n';

  return report;
}

