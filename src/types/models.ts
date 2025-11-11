import {
  BlogPostStatus,
  FocusAreaPriority,
  FocusAreaStatus,
  MilestoneTaskCategory,
  MilestoneTaskStatus,
  MilestoneTaskType,
  QuestionBankCategory,
  TeamMemberRole,
  TeamMemberStatus,
  UserRole,
  UserStatus,
} from './enums';

// Base model with common fields
export interface BaseModel {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// User Model
export interface User extends BaseModel {
  username?: string;
  fName?: string;
  mName?: string;
  lName?: string;
  phoneNumber?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  organizationId?: string;
  invitedByOrg?: boolean;
  admin?: boolean;
  lastLogin?: string;
  notes?: string;
}

// Kid Profile Model
export interface KidProfile extends BaseModel {
  name?: string;
  age?: number;
  dob?: string;
  parentId?: string;
  organizationId?: string;
  isDummy: boolean;
  isAutismDiagnosed: boolean;
  notes?: string;
  notesFileUrls?: string;
  orgAdminNotes?: string;
  orgAdminNotesFileUrls?: string;
  orgAdminNotesUpdatedAt?: string;
  orgAdminNotesUpdatedBy?: string;
}

// Milestone Task Model
export interface MilestoneTask extends BaseModel {
  externalId?: string;
  kidProfileId: string;
  focusAreaId?: string;
  title: string;
  type?: MilestoneTaskType;
  category?: MilestoneTaskCategory;
  parentId?: string;
  developmentalOverview?: string;
  parentFriendlyDescription?: string;
  strategies?: string;
  status?: MilestoneTaskStatus;
  progressPercentage?: number;
  parentFeedback?: string;
  isEffective?: boolean;
  feedbackDate?: string;
  calibrate?: boolean;
  blog_url?: string;
  video_link?: string;
  examples?: string;
  dayCount?: number;
  duration?: string;
  notes?: string;
  isUserGenerated?: boolean;
}

// Focus Area Model
export interface FocusArea extends BaseModel {
  kidProfileId: string;
  focusAreaCatalogId: string;
  status?: FocusAreaStatus;
  priority?: FocusAreaPriority;
  startDate?: string;
  targetDate?: string;
  notes?: string;
  completedCount?: number;
  totalCount?: number;
}

// Focus Area Catalog Model
export interface FocusAreaCatalog extends BaseModel {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic?: boolean;
}

// Team Model
export interface Team extends BaseModel {
  name?: string;
  kidProfileId?: string;
  adminId?: string;
}

// Team Member Model
export interface TeamMember extends BaseModel {
  teamId?: string;
  userId?: string;
  role?: TeamMemberRole;
  status?: TeamMemberStatus;
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
}

// Milestone Model
export interface Milestone extends BaseModel {
  title?: string;
  description?: string;
  kidProfileId?: string;
}

// Task Model
export interface Task extends BaseModel {
  title?: string;
  description?: string;
  videoLink?: string;
  milestoneId?: string;
}

// User Response Model
export interface UserResponse extends BaseModel {
  kidProfileId?: string;
  questionId?: string;
  answer?: string;
  timestamp?: string;
}

// Question Bank Model
export interface QuestionBank extends BaseModel {
  question_text?: string;
  category?: QuestionBankCategory;
  options?: string[];
}

// Parent Concerns Model
export interface ParentConcerns extends BaseModel {
  kidProfileId: string;
  concernText: string;
  timestamp: string;
}

// Blog Post Model
export interface BlogPost extends BaseModel {
  title: string;
  slug: string;
  content: string;
  summary?: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  status?: BlogPostStatus;
  isPublic?: boolean;
  images?: string[];
  tags?: string[];
  likes?: number;
  isFlagged?: boolean;
  flaggedReason?: string;
  shareUrl?: string;
  ogImage?: string;
}

// Blog Comment Model
export interface BlogComment extends BaseModel {
  blogPostId: string;
  authorId: string;
  authorName?: string;
  content: string;
  likes?: number;
  isFlagged?: boolean;
  parentId?: string;
  owner?: string;
}

// Organization Model
export interface Organization extends BaseModel {
  name: string;
  address: string;
  contactEmail: string;
  phone: string;
}

