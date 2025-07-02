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
  organizer: {
    name: string;
    avatar?: string;
  };

  isAttending?: boolean;
  formattedDate?: string;
  formattedTime?: string;
}
