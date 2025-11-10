# Questionnaire Features Implementation

## Summary

Three new features have been implemented for the questionnaire system:

1. ✅ **Scoring for Questions** - Added scoring fields to database models
2. ✅ **Anaya Questionnaire Summary Report** - Component to display at end of questionnaire
3. ✅ **LLM Milestone Generation** - Build string from answered questions for LLM (similar to comprehensive questionnaire)

---

## 1. Scoring for Questions

### Database Schema Updates

**UserResponse Model** (`src/types/models.ts`):
- Added `score?: number` - Score for individual answer
- Added `assessmentId?: string` - Link to assessment/questionnaire session

**QuestionBank Model** (`src/types/models.ts`):
- Added `scoring?: QuestionScoring` - Scoring configuration

**New QuestionScoring Interface**:
```typescript
interface QuestionScoring {
  type?: 'binary' | 'scale' | 'weighted';
  maxScore?: number;
  scoreMap?: Record<string, number>; // e.g., {"Yes": 10, "No": 0}
  weight?: number;
}
```

**New Assessment Model**:
- Tracks questionnaire sessions
- Stores overall scores and summary reports
- Links all responses together

### Usage

When saving a response, calculate and store the score:

```typescript
import { calculateResponseScore } from '@/utils/questionnaire-utils';

const score = calculateResponseScore(answer, question);
await saveUserResponse({
  kidProfileId,
  questionId: question.id,
  answer,
  score, // Store calculated score
  assessmentId,
});
```

---

## 2. Anaya Questionnaire Summary Report

### Component

**Location**: `src/components/questionnaire/AnayaSummaryReport.tsx`

### Features

- **Overall Score Display**: Shows total score, percentage, and status
- **Category Breakdown**: Scores by category (Cognition, Language, Motor, Social, Emotional)
- **Detailed Responses**: All questions and answers with individual scores
- **Save/Close Actions**: Buttons to save report or close

### Usage

```typescript
import { AnayaSummaryReport } from '@/components/questionnaire/AnayaSummaryReport';

<AnayaSummaryReport
  assessment={assessment}
  responses={responses}
  questions={questions}
  kidProfile={kidProfile}
  onClose={() => router.back()}
  onSave={async () => {
    await completeAssessment(assessment.id, responses, questions);
    // Navigate or show success message
  }}
/>
```

### Display at End of Questionnaire

Add this component to your Anaya questionnaire flow:

```typescript
// After all questions are answered
if (isComplete) {
  return (
    <AnayaSummaryReport
      assessment={currentAssessment}
      responses={userResponses}
      questions={anayaQuestions}
      kidProfile={kidProfile}
      onClose={() => router.replace('/(tabs)')}
      onSave={handleSaveReport}
    />
  );
}
```

---

## 3. LLM Milestone Generation

### Utility Function

**Location**: `src/utils/questionnaire-utils.ts`

**Function**: `buildQuestionnaireStringForLLM()`

### How It Works

Similar to comprehensive questionnaire, this function:
1. Takes all answered questions and responses
2. Formats them into a structured string
3. Groups by category
4. Includes scores and statistics
5. Returns formatted text ready for LLM processing

### Output Format

```
Child Profile:
  Name: [Kid Name]
  Age: [Age] months

Questionnaire Responses:
==================================================

Category: COGNITION
------------------------------
Q: [Question text]
A: [Answer]
Score: [score] / [maxScore]

Category: LANGUAGE
------------------------------
...

Summary Statistics:
------------------------------
Total Questions Answered: [count]
Scored Questions: [count]
Total Score: [total] / [max]
Percentage: [%]
```

### Usage

```typescript
import { buildQuestionnaireStringForLLM } from '@/utils/questionnaire-utils';
import { generateMilestonesFromQuestionnaire } from '@/services/api/questionnaire-service';

// Build the string
const questionnaireString = buildQuestionnaireStringForLLM(
  responses,
  questions,
  kidProfile.name,
  kidProfile.age
);

// Send to LLM API
const result = await generateMilestonesFromQuestionnaire(
  responses,
  questions,
  kidProfileId,
  kidProfile.name,
  kidProfile.age
);
```

### Service Function

**Location**: `src/services/api/questionnaire-service.ts`

**Function**: `generateMilestonesFromQuestionnaire()`

**Note**: The actual LLM API call is a placeholder. You'll need to:
1. Implement the GraphQL mutation in your backend
2. Connect to your LLM service (e.g., OpenAI, Bedrock, etc.)
3. Process the questionnaire string and generate milestones

---

## Additional Utilities

### Calculate Assessment Score

```typescript
import { calculateAssessmentScore } from '@/utils/questionnaire-utils';

const { totalScore, maxScore, percentage } = calculateAssessmentScore(
  responses,
  questions
);
```

### Generate Summary Report Text

```typescript
import { generateSummaryReport } from '@/utils/questionnaire-utils';

const reportText = generateSummaryReport(
  assessment,
  responses,
  questions,
  kidProfile.name
);
```

---

## Database Migration Notes

⚠️ **Important**: These are TypeScript type definitions. You'll need to:

1. **Update your GraphQL schema** in the backend to include:
   - `score` field on `UserResponse`
   - `scoring` field on `QuestionBank` (as JSON)
   - `Assessment` model with all fields

2. **Run migrations** to add these fields to your database

3. **Update existing questions** to include scoring configuration if needed

---

## Next Steps

1. **Backend Implementation**:
   - Add GraphQL schema for `Assessment` model
   - Add `score` field to `UserResponse` schema
   - Add `scoring` field to `QuestionBank` schema
   - Implement LLM milestone generation endpoint

2. **Frontend Integration**:
   - Integrate `AnayaSummaryReport` into Anaya questionnaire flow
   - Add scoring calculation when saving responses
   - Connect LLM milestone generation after questionnaire completion

3. **Testing**:
   - Test scoring calculation with different question types
   - Verify summary report displays correctly
   - Test LLM string generation format

---

## Files Created/Modified

### Created:
- `src/utils/questionnaire-utils.ts` - Utility functions
- `src/components/questionnaire/AnayaSummaryReport.tsx` - Summary report component
- `src/services/api/questionnaire-service.ts` - API service functions

### Modified:
- `src/types/models.ts` - Added scoring fields and Assessment model

---

## Questions?

If you need to review how the comprehensive questionnaire works in the web app, check:
- `https://github.com/Synchronicityai-org/questionnaire/tree/tinywins-dev`

The implementation follows the same pattern for building the questionnaire string for LLM processing.

