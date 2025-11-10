/**
 * Service for questionnaire/assessment operations
 */

import { generateClient } from 'aws-amplify/api';
import { Assessment, UserResponse, QuestionBank } from '@/types/models';
import { buildQuestionnaireStringForLLM } from '@/utils/questionnaire-utils';

const client = generateClient();

/**
 * Create a new assessment/questionnaire session
 */
export async function createAssessment(
  kidProfileId: string,
  type: 'ANAYA' | 'COMPREHENSIVE' | 'CUSTOM'
): Promise<Assessment> {
  try {
    const mutation = `
      mutation CreateAssessment($input: CreateAssessmentInput!) {
        createAssessment(input: $input) {
          id
          kidProfileId
          type
          status
          startedAt
          createdAt
        }
      }
    `;

    const variables = {
      input: {
        kidProfileId,
        type,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
      },
    };

    const result: any = await client.graphql({
      query: mutation,
      variables,
    });

    return result.data.createAssessment as Assessment;
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
}

/**
 * Save a user response to a question
 */
export async function saveUserResponse(
  response: Omit<UserResponse, 'id' | 'createdAt' | 'updatedAt'>
): Promise<UserResponse> {
  try {
    const mutation = `
      mutation CreateUserResponse($input: CreateUserResponseInput!) {
        createUserResponse(input: $input) {
          id
          kidProfileId
          questionId
          answer
          score
          timestamp
          assessmentId
          createdAt
        }
      }
    `;

    const variables = {
      input: {
        ...response,
        timestamp: response.timestamp || new Date().toISOString(),
      },
    };

    const result: any = await client.graphql({
      query: mutation,
      variables,
    });

    return result.data.createUserResponse as UserResponse;
  } catch (error) {
    console.error('Error saving user response:', error);
    throw error;
  }
}

/**
 * Complete an assessment and generate summary
 */
export async function completeAssessment(
  assessmentId: string,
  responses: UserResponse[],
  questions: QuestionBank[]
): Promise<Assessment> {
  try {
    // Calculate total score
    const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0);
    const maxScore = responses.reduce((sum, r) => {
      const question = questions.find((q) => q.id === r.questionId);
      return sum + (question?.scoring?.maxScore || 0);
    }, 0);

    const mutation = `
      mutation UpdateAssessment($input: UpdateAssessmentInput!) {
        updateAssessment(input: $input) {
          id
          status
          completedAt
          totalScore
          maxScore
          summaryReport
        }
      }
    `;

    const variables = {
      input: {
        id: assessmentId,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        totalScore,
        maxScore,
      },
    };

    const result: any = await client.graphql({
      query: mutation,
      variables,
    });

    return result.data.updateAssessment as Assessment;
  } catch (error) {
    console.error('Error completing assessment:', error);
    throw error;
  }
}

/**
 * Get all responses for an assessment
 */
export async function getAssessmentResponses(
  assessmentId: string
): Promise<UserResponse[]> {
  try {
    const query = `
      query ListUserResponses($filter: ModelUserResponseFilterInput) {
        listUserResponses(filter: $filter) {
          items {
            id
            kidProfileId
            questionId
            answer
            score
            timestamp
            assessmentId
            createdAt
          }
        }
      }
    `;

    const variables = {
      filter: {
        assessmentId: { eq: assessmentId },
      },
    };

    const result: any = await client.graphql({
      query,
      variables,
    });

    return result.data.listUserResponses.items as UserResponse[];
  } catch (error) {
    console.error('Error fetching assessment responses:', error);
    throw error;
  }
}

/**
 * Build questionnaire string and send to LLM for milestone generation
 * Similar to comprehensive questionnaire flow
 */
export async function generateMilestonesFromQuestionnaire(
  responses: UserResponse[],
  questions: QuestionBank[],
  kidProfileId: string,
  kidProfileName?: string,
  kidAge?: number
): Promise<any> {
  try {
    // Build the questionnaire string
    const questionnaireString = buildQuestionnaireStringForLLM(
      responses,
      questions,
      kidProfileName,
      kidAge
    );

    // TODO: Call your LLM API endpoint here
    // This is a placeholder - you'll need to implement the actual LLM call
    // based on your backend API
    
    const mutation = `
      mutation GenerateMilestonesFromQuestionnaire($input: GenerateMilestonesInput!) {
        generateMilestonesFromQuestionnaire(input: $input) {
          milestones {
            id
            title
            description
            category
          }
        }
      }
    `;

    const variables = {
      input: {
        kidProfileId,
        questionnaireData: questionnaireString,
      },
    };

    // For now, return the string that would be sent to LLM
    // You'll need to implement the actual GraphQL mutation based on your backend
    console.log('Questionnaire string for LLM:', questionnaireString);

    // Placeholder return - replace with actual API call
    return {
      questionnaireString,
      // milestones: result.data.generateMilestonesFromQuestionnaire.milestones,
    };
  } catch (error) {
    console.error('Error generating milestones from questionnaire:', error);
    throw error;
  }
}

/**
 * Get questions for a specific questionnaire type
 */
export async function getQuestionsByType(
  type: 'ANAYA' | 'COMPREHENSIVE' | 'CUSTOM',
  category?: string
): Promise<QuestionBank[]> {
  try {
    const query = `
      query ListQuestionBanks($filter: ModelQuestionBankFilterInput) {
        listQuestionBanks(filter: $filter) {
          items {
            id
            question_text
            category
            options
            scoring {
              type
              maxScore
              scoreMap
              weight
            }
            createdAt
          }
        }
      }
    `;

    // Note: You may need to adjust the filter based on your schema
    // This assumes questions are tagged by type somehow
    const variables: any = {};
    if (category) {
      variables.filter = {
        category: { eq: category },
      };
    }

    const result: any = await client.graphql({
      query,
      variables,
    });

    return result.data.listQuestionBanks.items as QuestionBank[];
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

