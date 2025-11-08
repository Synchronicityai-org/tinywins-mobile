// User Role Enum
export enum UserRole {
  PARENT = 'PARENT',
  CAREGIVER = 'CAREGIVER',
  CLINICIAN = 'CLINICIAN',
  ORG_ADMIN = 'ORG_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  SME = 'SME',
  DOCTOR = 'DOCTOR',
  THERAPIST = 'THERAPIST',
  ADMIN = 'ADMIN',
}

// User Status Enum
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
}

// Milestone Task Status Enum
export enum MilestoneTaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

// Milestone Task Type Enum
export enum MilestoneTaskType {
  MILESTONE = 'MILESTONE',
  TASK = 'TASK',
}

// Milestone Task Category Enum
export enum MilestoneTaskCategory {
  COGNITION = 'COGNITION',
  LANGUAGE = 'LANGUAGE',
  MOTOR = 'MOTOR',
  SOCIAL = 'SOCIAL',
  EMOTIONAL = 'EMOTIONAL',
}

// Focus Area Status Enum
export enum FocusAreaStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

// Focus Area Priority Enum
export enum FocusAreaPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// Team Member Role Enum
export enum TeamMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

// Team Member Status Enum
export enum TeamMemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
}

// Question Bank Category Enum
export enum QuestionBankCategory {
  COGNITION = 'COGNITION',
  LANGUAGE = 'LANGUAGE',
  MOTOR = 'MOTOR',
  SOCIAL = 'SOCIAL',
  EMOTIONAL = 'EMOTIONAL',
}

// Blog Post Status Enum
export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  FLAGGED = 'FLAGGED',
  DELETED = 'DELETED',
}

