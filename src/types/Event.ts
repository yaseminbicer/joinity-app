export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  location_lat?: number;
  location_lng?: number;
  image?: string;
  maxAttendees?: number;
  category_id: number;
  category?: string; 

  attendees: number; 
  organizer: string;
  isAttending?: boolean;
}
