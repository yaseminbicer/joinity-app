import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import EventCard from '@/components/EventCard';
import CreateEventModal from '@/components/CreateEventModal';
import UserProfile from '@/components/UserProfile';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';



function formatNumber(num: number) {
  if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
  return num.toString();
}

const Index = () => {
  // Listen for Supabase auth state changes globally
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        // Session is gone (invalid refresh token, logout, etc)
        setCurrentUser(null);
        setShowAuthDialog(true);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);
  // Giriş/kayıt sonrası kullanıcıyı güncelleyen fonksiyon
  const handleAuthSuccess = async () => {
    console.log('INDEX onAuthSuccess ÇALIŞTI');
    const { data, error } = await supabase.auth.getUser();
    console.log('SUPABASE LOGIN data:', data);
    console.log('SUPABASE LOGIN error:', error);
    console.log('SUPABASE LOGIN user:', data?.user);
    if (data?.user) {
      setCurrentUser({
        name: data.user.user_metadata?.name || data.user.email.split('@')[0],
        email: data.user.email,
        eventsCreated: 0,
        eventsAttended: 0,
        location: ''
      });
      setShowAuthDialog(false);
      toast.success('Başarıyla giriş yapıldı!');
    } else {
      toast.error('Giriş başarısız. Lütfen tekrar deneyin.');
    }
  };
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({ category: '' });
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [attendeeCount, setAttendeeCount] = useState<number | null>(null);
 // Etkinlikleri supabase'den çek
 useEffect(() => {
  const fetchEvents = async () => {
    let query = supabase.from('events').select(`*, event_attendees(*)`);
    const categoryId = Number(filters.category);
    if (filters.category && !isNaN(categoryId) && filters.category !== '') {
      query = query.eq('category_id', categoryId);
    }
    const { data, error } = await query;
    if (!error && data) {
      const eventsWithFormat = data.map((event: any) => {
        let dateStr = event.date;
        let timeStr = event.time;
        let dateObj = null;
        try {
          dateObj = new Date(`${dateStr}T${timeStr}`);
        } catch {
          dateObj = null;
        }
        return {
          ...event,
          formattedDate: dateObj && !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
            : '',
          formattedTime: dateObj && !isNaN(dateObj.getTime())
            ? dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            : '',
          attendees: event.event_attendees ? event.event_attendees.length : 0,
          organizer: { name: event.organizer_name || event.organizerEmail || 'Bilinmiyor', avatar: '' }
        };
      });
      setEvents(eventsWithFormat);
    } else {
      console.error('fetchEvents error:', error?.message);
      setEvents([]);
    }
  };

  fetchEvents();
  const fetchStats = async () => {
          // Etkinlik sayısı
          const { count: eventCountRes } = await supabase
          .from('events')
          .select('id', { count: 'exact', head: true });
        setEventCount(eventCountRes || 0);
      // Katılımcı sayısı
      const { count: attendeeCountRes } = await supabase
        .from('event_attendees')
        .select('id', { count: 'exact', head: true });      
        setAttendeeCount(attendeeCountRes || 0);
      };
      fetchStats();
    }, []);
    const handleLogin = (email: string, password: string) => {
      setCurrentUser({
        name: email.split('@')[0],
        email: email,
        eventsCreated: 3,
        eventsAttended: 8,
        location: 'İstanbul'
      });
      toast.success('Başarıyla giriş yapıldı!');
    };
  
    const handleRegister = (name: string, email: string, password: string) => {
      setCurrentUser({
        name: name,
        email: email,
        eventsCreated: 0,
        eventsAttended: 0,
        location: ''
      });
      toast.success('Hesabınız başarıyla oluşturuldu!');
    };
  
    // Event ekleme işlemi
    const handleCreateEvent = (eventData: any) => {
      const newEvent = {
        id: Date.now().toString(),
        ...eventData,
        currentParticipants: 0,
        organizer: {
          name: currentUser?.name || 'Anonim',
          avatar: ''
        }
      };
      setEvents(prev => [...prev, newEvent]);
      toast.success('Etkinlik başarıyla oluşturuldu!');
    };
  
    // Modal kapandığında çağrılacak fonksiyon
    const handleEventCreated = () => {
      setShowCreateEventDialog(false);
      // Burada istersen event listesini yeniden fetch edebilirsin.
    };
  
    const handleJoinEvent = (eventId: string) => {
      if (!currentUser) {
        setShowAuthDialog(true);
        return;
      }
      toast.success('Katılım isteğiniz gönderildi!');
    };
  
    const handleRecommendEvent = (eventId: string) => {
      if (!currentUser) {
        setShowAuthDialog(true);
        return;
      }
      toast.success('Etkinlik arkadaşlarınıza önerildi!');
    };
  
    const handleViewProfile = (organizerName: string) => {
      toast.info(`${organizerName} profilini görüntülüyorsunuz`);
    };
  
    const handleAddFriend = (userId: string) => {
      toast.success('Arkadaşlık isteği gönderildi!');
    };
  
    const handleFiltersChange = (newFilters: any) => {
      setFilters((prev: any) => ({ ...prev, ...newFilters }));
    };
    
  
    return (
      <div className="min-h-screen bg-gray-50">
              <Header currentUser={currentUser} onCreateEvent={() => setShowCreateEventDialog(true)} />
      <AuthModal
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onAuthSuccess={async () => {
          // Giriş/kayıt sonrası Supabase'den kullanıcıyı çek
          const { data } = await supabase.auth.getUser();
          setCurrentUser(data.user);
        }}
      />
      {/* Sağ üstte Etkinlik Oluştur butonu sadece giriş yaptıysa */}
      {currentUser && (
        <div className="absolute right-8 top-6 z-20">
          <Button
            className="bg-gradient-to-r from-[#7B6CF6] to-[#5FD2F3] text-white font-bold shadow-lg px-6 py-2 rounded-xl hover:opacity-90 transition"
            onClick={() => setShowCreateEventDialog(true)}
          >
            + Etkinlik Oluştur
          </Button>
        </div>
      )}
 <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="rounded-2xl p-12 mb-8 text-center bg-gradient-to-r from-[#7B6CF6] to-[#5FD2F3] relative flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow">Topluluk Etkinlik Takvimi</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">Çevrendeki etkinlikleri keşfet, yeni insanlarla tanış ve unutulmaz anılar biriktir</p>
          <div className="flex flex-row gap-6 justify-center">
            <div className="bg-white/90 rounded-xl px-8 py-4 flex flex-col items-center shadow-md">
              <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7B6CF6] to-[#5FD2F3]">{eventCount !== null ? formatNumber(eventCount) : '...'}</span>
              <span className="font-medium text-gray-700 mt-1">Etkinlik</span>
            </div>
            <div className="bg-white/90 rounded-xl px-8 py-4 flex flex-col items-center shadow-md">
              <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7B6CF6] to-[#5FD2F3]">{attendeeCount !== null ? formatNumber(attendeeCount) : '...'}</span>
              <span className="font-medium text-gray-700 mt-1">Katılımcı</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">            <FilterBar onFiltersChange={handleFiltersChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  attendees={event.attendees ? event.attendees.length : 0}
                  attendanceStatus={'none'}
                  onAttendToggle={handleJoinEvent}
                  isAuth={!!currentUser}
                />
              ))}
            </div>
            </div>

{/* Sidebar */}
<div className="space-y-6">            
  {currentUser && (
              <UserProfile
                user={currentUser}
                onAddFriend={handleAddFriend}
                isCurrentUser={true}
              />
            )}
             <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform İstatistikleri</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Etkinlik</span>                  <span className="font-semibold gradient-blue bg-clip-text text-transparent">{eventCount !== null ? formatNumber(eventCount) : '...'}</span>
                <span className="font-semibold gradient-blue bg-clip-text text-transparent">{eventCount !== null ? formatNumber(eventCount) : '...'}</span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-600">Aktif Kullanıcı</span>
                  <span className="font-semibold gradient-purple bg-clip-text text-transparent">{attendeeCount !== null ? formatNumber(attendeeCount) : '...'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bu Ay</span>
                  <span className="font-semibold gradient-green bg-clip-text text-transparent">45</span>
                </div>
              </div>
            </div>

            {/* Recommended Events */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Önerilen Etkinlikler</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm">AI & Makine Öğrenmesi</h4>
                  <p className="text-blue-700 text-xs">28 Temmuz - İstanbul</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 text-sm">Design Thinking Workshop</h4>
                  <p className="text-purple-700 text-xs">2 Ağustos - Ankara</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AuthModal
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <CreateEventModal
        isOpen={showCreateEventDialog}
        onClose={() => setShowCreateEventDialog(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default Index;
