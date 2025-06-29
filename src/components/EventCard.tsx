
import React from 'react';
import { Calendar, MapPin, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import EventMap from './EventMap';

import type { Event } from "../types/Event";

interface EventCardProps {
  event: Event;
  attendees: number;
  isAttending: boolean;
  onAttendToggle: (eventId: string) => void;
  isAuth: boolean;
}

import { Link } from 'react-router-dom';

const EventCard: React.FC<EventCardProps> = ({ event, attendees, isAttending, onAttendToggle, isAuth }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Teknoloji': 'bg-blue-100 text-blue-800',
      'Sanat': 'bg-purple-100 text-purple-800',
      'Spor': 'bg-green-100 text-green-800',
      'Müzik': 'bg-pink-100 text-pink-800',
      'Eğitim': 'bg-yellow-100 text-yellow-800',
      'Sosyal': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Link to={`/event/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-white overflow-hidden cursor-pointer">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-white/80" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
            {event.category}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {new Date(event.date).getDate()}
            </div>
            <div className="text-xs text-gray-600 uppercase">
              {new Date(event.date).toLocaleDateString('tr-TR', { month: 'short' })}
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pb-2">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {event.description}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Date & Time */}
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            <span className="text-sm">
              {formatDate(event.date)} • {event.time}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-red-500" />
            <span className="text-sm truncate">{event.location}</span>
          </div>
          {/* Event Map */}
          {event.location_lat && event.location_lng && (
            <div className="my-2 rounded overflow-hidden" style={{ height: 180 }}>
              <EventMap events={[event]} />
            </div>
          )}

          {/* Attendees */}
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2 text-green-500" />
            <span className="text-sm">
              {attendees} katılımcı
              {event.maxAttendees && ` / ${event.maxAttendees}`}
            </span>
          </div>

          {/* Organizer */}
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2 text-purple-500" />
            <span className="text-sm">{event.organizer}</span>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Button
              onClick={() => onAttendToggle(event.id)}
              className={`w-full transition-all duration-200 ${
                isAttending 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={!isAuth}
            >
              {!isAuth ? 'Giriş yapın' : (isAttending ? 'Katılıyorum ✓' : 'Katıl')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
};

export default EventCard;
