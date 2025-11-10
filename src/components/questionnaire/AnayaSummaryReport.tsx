/**
 * Summary Report Component for Anaya Questionnaire
 * Displays at the end of the Anaya questionnaire
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Assessment, UserResponse, QuestionBank, KidProfile } from '@/types/models';
import { generateSummaryReport, calculateAssessmentScore } from '@/utils/questionnaire-utils';

interface AnayaSummaryReportProps {
  assessment: Assessment;
  responses: UserResponse[];
  questions: QuestionBank[];
  kidProfile?: KidProfile;
  onClose?: () => void;
  onSave?: () => void;
}

export function AnayaSummaryReport({
  assessment,
  responses,
  questions,
  kidProfile,
  onClose,
  onSave,
}: AnayaSummaryReportProps) {
  const { totalScore, maxScore, percentage } = calculateAssessmentScore(responses, questions);
  const reportText = generateSummaryReport(assessment, responses, questions, kidProfile?.name);

  // Group responses by category for display
  const questionMap = new Map<string, QuestionBank>();
  questions.forEach((q) => {
    if (q.id) {
      questionMap.set(q.id, q);
    }
  });

  const categoryGroups = new Map<string, { response: UserResponse; question: QuestionBank }[]>();
  
  responses.forEach((response) => {
    if (response.questionId) {
      const question = questionMap.get(response.questionId);
      if (question) {
        const category = question.category || 'UNCATEGORIZED';
        if (!categoryGroups.has(category)) {
          categoryGroups.set(category, []);
        }
        categoryGroups.get(category)!.push({ response, question });
      }
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Anaya Questionnaire Summary</Text>
        {kidProfile?.name && (
          <Text style={styles.subtitle}>For: {kidProfile.name}</Text>
        )}
      </View>

      {/* Overall Score Card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Overall Score</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>
            {totalScore} / {maxScore}
          </Text>
          <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
        </View>
        {percentage >= 80 && (
          <Text style={styles.scoreStatus}>Excellent Progress</Text>
        )}
        {percentage >= 60 && percentage < 80 && (
          <Text style={styles.scoreStatus}>Good Progress</Text>
        )}
        {percentage < 60 && (
          <Text style={styles.scoreStatus}>Needs Attention</Text>
        )}
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {Array.from(categoryGroups.entries()).map(([category, items]) => {
          const catScore = items.reduce((sum, item) => sum + (item.response.score || 0), 0);
          const catMax = items.reduce((sum, item) => {
            return sum + (item.question.scoring?.maxScore || 0);
          }, 0);
          const catPercentage = catMax > 0 ? (catScore / catMax) * 100 : 0;

          return (
            <View key={category} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryScore}>
                  {catScore} / {catMax} ({catPercentage.toFixed(1)}%)
                </Text>
              </View>
              <Text style={styles.categoryCount}>
                {items.length} question{items.length !== 1 ? 's' : ''} answered
              </Text>
            </View>
          );
        })}
      </View>

      {/* Detailed Responses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Responses</Text>
        {Array.from(categoryGroups.entries()).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {items.map(({ response, question }) => (
              <View key={response.id} style={styles.responseItem}>
                <Text style={styles.questionText}>
                  {question.question_text || 'Question'}
                </Text>
                <Text style={styles.answerText}>
                  Answer: {response.answer || 'No answer'}
                </Text>
                {response.score !== undefined && (
                  <Text style={styles.scoreText}>
                    Score: {response.score}
                    {question.scoring?.maxScore && ` / ${question.scoring.maxScore}`}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {onSave && (
          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveButtonText}>Save Report</Text>
          </TouchableOpacity>
        )}
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 12,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  scoreStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  responseItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

