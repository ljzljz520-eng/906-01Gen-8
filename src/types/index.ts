export enum SensitivityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  TOP_SECRET = 'top_secret',
}

export enum VerificationStatus {
  PENDING = 'pending',
  DESENSITIZATION = 'desensitization',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum UserRole {
  GUEST = 'guest',
  RESEARCHER = 'researcher',
  AUTHORIZED = 'authorized',
  ADMIN = 'admin',
}

export interface AffectedVersion {
  vendor: string;
  product: string;
  versionRange: string;
}

export type TimelineEventType =
  | 'submit'
  | 'review'
  | 'desensitize'
  | 'publish'
  | 'reject'
  | 'update';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  operatorName: string;
  operatorRole: UserRole;
  timestamp: string;
  comment: string;
}

export interface Vulnerability {
  id: string;
  cveId?: string;
  vulnCode: string;
  title: string;
  description: string;
  affectedVersions: AffectedVersion[];
  reproductionConditions: string;
  repairSuggestion: string;
  pocCode: string;
  pocCodeDesensitized?: string;
  sensitivityLevel: SensitivityLevel;
  verificationStatus: VerificationStatus;
  submitterId: string;
  submitterName: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewerName?: string;
  rejectReason?: string;
  desensitizationRequest?: string;
  timeline: TimelineEvent[];
  disclaimerAccepted: boolean;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  email: string;
  authorizedScope?: SensitivityLevel[];
  createdAt: string;
}

export interface SensitivityKeywordMatch {
  keyword: string;
  pattern: string;
  suggestedLevel: SensitivityLevel;
  highlight: string;
  triggerDesensitization?: boolean;
}

export interface SensitivityAnalysisResult {
  suggestedLevel: SensitivityLevel;
  matches: SensitivityKeywordMatch[];
  riskScore: number;
  needDesensitization: boolean;
  desensitizationHints: string[];
}

export interface VulnFilter {
  keyword: string;
  sensitivity?: SensitivityLevel[];
  status?: VerificationStatus[];
  product?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SubmitVulnForm {
  cveId?: string;
  title: string;
  description: string;
  affectedVersions: AffectedVersion[];
  reproductionConditions: string;
  repairSuggestion: string;
  pocCode: string;
  disclaimerAccepted: boolean;
}
