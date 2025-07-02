import { User, Calendar, Users, MapPin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    eventsCreated: number;
    eventsAttended: number;
    location?: string;
  };
  onAddFriend: (userId: string) => void;
  isCurrentUser?: boolean;
}

const UserProfile = ({ user, onAddFriend, isCurrentUser = false }: UserProfileProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
      {/* Gradient Avatar */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7B6CF6] to-[#5FD2F3] flex items-center justify-center mb-4">
        <User className="w-12 h-12 text-white" />
      </div>
      {/* Name, Email, Location */}
      <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
      <div className="flex items-center text-gray-600 mb-1">
        <Mail className="w-4 h-4 mr-1" />
        <span className="text-sm">{user.email}</span>
      </div>
      {user.location && (
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{user.location}</span>
        </div>
      )}
      {/* Stats */}
      <div className="flex w-full gap-3 mt-4">
        <div className="flex-1 flex flex-col items-center bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl py-4 shadow">
          <Calendar className="w-6 h-6 text-[#7B6CF6] mb-1" />
          <div className="text-2xl font-bold text-[#7B6CF6]">{user.eventsCreated}</div>
          <div className="text-xs text-gray-700 mt-1">Oluşturulan Etkinlik</div>
        </div>
        <div className="flex-1 flex flex-col items-center bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl py-4 shadow">
          <Users className="w-6 h-6 text-[#A259F7] mb-1" />
          <div className="text-2xl font-bold text-[#A259F7]">{user.eventsAttended}</div>
          <div className="text-xs text-gray-700 mt-1">Katılınan Etkinlik</div>
        </div>
      </div>

      {/* Actions */}
      {!isCurrentUser && (
        <div className="space-y-2">
          <Button
            onClick={() => onAddFriend(user.email)}
            className="w-full gradient-green text-white hover:opacity-90"
          >
            Arkadaş Ekle
          </Button>
          <Button
            variant="outline"
            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            Mesaj Gönder
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
