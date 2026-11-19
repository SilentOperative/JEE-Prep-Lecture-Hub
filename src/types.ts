export type Subject = "Physics" | "Chemistry" | "Mathematics" | "Biology";
export type Lecture = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  telegramPostUrl?: string;
  videoUrl?: string;
  completed?: boolean;
};
export type Chapter = {
  id: string;
  name: string;
  classLevel: 11 | 12;
  subject: Subject;
  order: number;
  lectures: Lecture[];
};