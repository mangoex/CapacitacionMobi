export interface Participant {
  id: string;
  name: string;
}

export interface Training {
  id: string;
  trainingName: string;
  trainerName: string;
  objective: string;
  duration: number;
  requestingArea: string;
  location: string;
  participants: Participant[];
  dateAdded: string;
  scheduledDate: string;
  investment: number;
}