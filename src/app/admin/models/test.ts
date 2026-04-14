export interface CreateTestRequest {
  title: string;
  description: string;
  subTestType: string; // e.g., "READING"
  totalTimeLimitMinutes: number;
}

export interface TestResponse {
  timestamp: string;
  status: number;
  data: {
    id: number;
    title: string;
    description: string;
    subTestType: string;
    totalTimeLimitMinutes: number;
    published: boolean;
    createdByName: string;
    createdAt: string;
  };
  error: string;
}