export enum UserRole {
  VISITOR = 'VISITOR',
  CLIENT = 'CLIENT',
  COUNSELOR = 'COUNSELOR',
  ADMIN = 'ADMIN'
}

export interface Counselor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  avatar: string;
  price: number;
  available: boolean;
  rating: number;
  experienceYears: number;
}

export interface Appointment {
  id: string;
  counselorId: string;
  counselorName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  link?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  moodScore: number; // 1-10
  sentiment: string; // AI generated summary
  suggestion: string; // AI generated suggestion
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
}

export interface AiMatchResponse {
  matchedCounselorIds: string[];
  reasoning: string;
}

export interface AiMoodResponse {
  moodScore: number;
  sentiment: string;
  suggestion: string;
}
