export interface Attachment {
  id: string;
  name: string;
  type: 'audio' | string;
  data: string; // base64 URL
}

export interface SessionNote {
  id: string;
  date: string;
  text: string;
  author: string;
  attachments: Attachment[];
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  diagnosis: string;
  caseHistory: string;
  treatmentPlan: string;
  additionalNotes: string;
  progress: number;
  sessionNotes: SessionNote[];
}

export interface AIInsight {
  analysisSummary: string;
  suggestedProgress: number;
  strategies: {
    title: string;
    description: string;
  }[];
}
