
import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import { Calendar, Filter, Grid, List, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { getUser } from '@/utils/auth';
import type { Event } from "../types/Event";
import type { Category } from "../types/Category";
import EventMap from './EventMap';

const EventList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]); // çoklu kategori
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [locationSearch, setLocationSearch] = useState('');

  const [sortBy, setSortBy] = useState<string>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [attendeesMap, setAttendeesMap] = useState<Record<string, number>>({});
  const [userAttendingMap, setUserAttendingMap] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>(null);

  // Kategorileri çek
  useEffect(() => {
    (async () => {

      const { data, error } = await supabase.from('categories').select('*').order('name');
      console.log('categories:', data, error);
      setCategories(data || []);
    })();
  }, []);

  // Kullanıcı bilgisini çek
  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
    })();
  }, []);

  // Supabase'den eventleri çek ve realtime güncelle
  useEffect(() => {
    let subscription: any;
    const fetchEvents = async () => {

      const { data, error } = await supabase.from('events').select('*');
      if (!error && data) {
        setEvents(data as Event[]);
        setFilteredEvents(data as Event[]);
        // Katılımcı sayısı ve kullanıcı katılımı için attendee verilerini çek
        fetchAttendees(data as Event[]);
      } else {
        setEvents([]);
        setFilteredEvents([]);
      }
      // Realtime subscription
      subscription = supabase.channel('public:events')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
          fetchEvents(); // Yeniden fetch et
        })
        .subscribe();
    };
    const fetchAttendees = async (events: Event[]) => {

      // Tüm etkinlikler için attendee sayılarını çek
      const { data: allAttendees, error } = await supabase.from('event_attendees').select('*');
      if (!error && allAttendees) {
        const map: Record<string, number> = {};
        const userMap: Record<string, boolean> = {};
        events.forEach(event => {
          const attendees = allAttendees.filter((a: any) => a.event_id === event.id);
          map[event.id] = attendees.length;
          if (user && user.id) {
            userMap[event.id] = attendees.some((a: any) => a.user_id === user.id);
          }
        });
        setAttendeesMap(map);
        setUserAttendingMap(userMap);
      }
    };
    fetchEvents();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
    // user değişirse attendee'ları tekrar kontrol et
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Katılım işlemi
  const handleAttendToggle = async (eventId: string) => {
    if (!user) {
      toast({ title: "Giriş yapmalısınız", description: "Etkinliğe katılmak için giriş yapın.", variant: "destructive" });
      return;
    }
    const isAttending = userAttendingMap[eventId];
    if (isAttending) {
      // Katılımı bırak
      const { error } = await supabase.from('event_attendees').delete().match({ event_id: eventId, user_id: user.id });
      if (!error) {
        toast({ title: "Katılım bırakıldı", description: "Etkinlikten ayrıldınız." });
      } else {
        toast({ title: "Hata", description: error.message, variant: "destructive" });
      }
    } else {
      // Katıl
      const { error } = await supabase.from('event_attendees').insert([{ event_id: eventId, user_id: user.id }]);
      if (!error) {
        toast({ title: "Katıldınız", description: "Etkinliğe başarıyla katıldınız." });
      } else {
        toast({ title: "Hata", description: error.message, variant: "destructive" });
      }
    }
    // Katılım değişti, attendee'ları tekrar yükle
    const { data: allAttendees } = await supabase.from('event_attendees').select('*');
    const map: Record<string, number> = {};
    const userMap: Record<string, boolean> = {};
    events.forEach(event => {
      const attendees = (allAttendees || []).filter((a: any) => a.event_id === event.id);
      map[event.id] = attendees.length;
      if (user && user.id) {
        userMap[event.id] = attendees.some((a: any) => a.user_id === user.id);
      }
    });
    setAttendeesMap(map);
    setUserAttendingMap(userMap);
  };

  useEffect(() => {
    let filtered = events;

    // Çoklu kategori filtresi
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event => selectedCategories.includes(event.category_id));
    }

    // Tarih aralığı filtresi
    if (dateRange.start) {
      filtered = filtered.filter(event => event.date >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(event => event.date <= dateRange.end);
    }

    // Konum arama filtresi
    if (locationSearch.trim() !== '') {
      filtered = filtered.filter(event => event.location.toLowerCase().includes(locationSearch.toLowerCase()));
    }



    // Sıralama
    if (sortBy === 'date') {
      filtered = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'attendees') {
      filtered = [...filtered].sort((a, b) => b.attendees - a.attendees);
    } else if (sortBy === 'title') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategories, dateRange, locationSearch, sortBy]);

  // Kullanıcı konumunu al
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="space-y-8">
      {/* Harita */}
      <EventMap events={filteredEvents} userLocation={userLocation} />
      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Çoklu kategori seçimi */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <Select
                value={selectedCategories.length > 0 ? selectedCategories[0].toString() : ""}
                onValueChange={value => setSelectedCategories([Number(value)])}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Kategori seç" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Tarih aralığı seçici */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
                className="border rounded px-2 py-1 text-sm"
                placeholder="Başlangıç"
              />
              <span>-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
                className="border rounded px-2 py-1 text-sm"
                placeholder="Bitiş"
              />
            </div>
            {/* Konum arama */}
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <input
                type="text"
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
                placeholder="Konum ara (örn: İstanbul)"
              />
            </div>

            {/* Sıralama */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Tarihe Göre</SelectItem>
                <SelectItem value="attendees">Katılımcı Sayısına Göre</SelectItem>
                <SelectItem value="title">İsme Göre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Events Grid/List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Etkinlik bulunamadı
          </h3>
          <div className="text-center text-gray-500 py-8">Hiç etkinlik bulunamadı.</div>
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : ''}`}>
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              attendees={attendeesMap[event.id] || 0}
              isAttending={userAttendingMap[event.id] || false}
              isAuth={!!user}
              onAttendToggle={handleAttendToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
