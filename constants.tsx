import { Counselor, Appointment, JournalEntry } from './types';

export const MOCK_COUNSELORS: Counselor[] = [
  {
    id: 'c1',
    name: 'Dr. Sarah Lin',
    title: 'Senior Clinical Psychologist',
    specialties: ['Anxiety', 'Depression', 'CBT'],
    bio: 'Over 15 years of experience helping individuals overcome severe anxiety and depression using Cognitive Behavioral Therapy.',
    avatar: 'https://picsum.photos/150/150?random=1',
    price: 800,
    available: true,
    rating: 4.9,
    experienceYears: 15
  },
  {
    id: 'c2',
    name: 'Michael Chen',
    title: 'Marriage & Family Therapist',
    specialties: ['Relationships', 'Family Dynamics', 'Couples Therapy'],
    bio: 'Specializing in rebuilding trust and communication within families and couples.',
    avatar: 'https://picsum.photos/150/150?random=2',
    price: 600,
    available: true,
    rating: 4.8,
    experienceYears: 8
  },
  {
    id: 'c3',
    name: 'Elena Zhang',
    title: 'Mindfulness Coach',
    specialties: ['Stress Management', 'Mindfulness', 'Career Burnout'],
    bio: 'Helping professionals manage high-stress environments through mindfulness and meditation techniques.',
    avatar: 'https://picsum.photos/150/150?random=3',
    price: 500,
    available: true,
    rating: 4.9,
    experienceYears: 6
  },
  {
    id: 'c4',
    name: 'David Wang',
    title: 'Child Psychologist',
    specialties: ['Adolescent Issues', 'ADHD', 'School Anxiety'],
    bio: 'Compassionate care for children and teens facing developmental and social challenges.',
    avatar: 'https://picsum.photos/150/150?random=4',
    price: 700,
    available: false,
    rating: 4.7,
    experienceYears: 12
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    counselorId: 'c1',
    counselorName: 'Dr. Sarah Lin',
    date: '2023-10-25',
    time: '14:00',
    status: 'upcoming',
    link: 'videoroom'
  },
  {
    id: 'a2',
    counselorId: 'c2',
    counselorName: 'Michael Chen',
    date: '2023-10-20',
    time: '10:00',
    status: 'completed'
  }
];

export const MOCK_JOURNAL: JournalEntry[] = [
  {
    id: 'j1',
    date: '2023-10-20',
    content: 'I felt really anxious about the presentation today.',
    moodScore: 4,
    sentiment: 'High anxiety regarding performance',
    suggestion: 'Try the 4-7-8 breathing technique before your next meeting.'
  },
  {
    id: 'j2',
    date: '2023-10-22',
    content: 'Had a great walk in the park. Felt peaceful.',
    moodScore: 8,
    sentiment: 'Calm and rejuvenated',
    suggestion: 'Keep engaging in nature walks to maintain this balance.'
  }
];
