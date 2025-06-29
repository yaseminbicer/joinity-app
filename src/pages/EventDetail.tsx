import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import EventMap from '@/components/EventMap';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const eventId = Number(id);
      console.log("Supabase event id sorgusu:", eventId);
      const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
      console.log("Supabase event data:", data, "error:", error);
      setEvent(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-lg">Yükleniyor...</div>;
  if (!event) return <div className="text-center py-20 text-red-500">Etkinlik bulunamadı.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      {event.image && (
        <img src={event.image} alt={event.title} className="w-full rounded my-4 max-h-80 object-cover" />
      )}
      <div className="text-gray-700 my-2 whitespace-pre-line">{event.description}</div>
      <div className="flex flex-col gap-1 text-gray-600 text-sm mt-4">
        <span><strong>Tarih:</strong> {event.date} {event.time}</span>
        <span><strong>Konum:</strong> {event.location}</span>
        <span><strong>Kategori:</strong> {event.category || event.category_id}</span>
        <span><strong>Organizatör:</strong> {event.organizer}</span>
        <span><strong>Maksimum Katılımcı:</strong> {event.maxAttendees || '-'}</span>
      </div>
      {event.location_lat && event.location_lng && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Etkinlik Konumu</h2>
          <EventMap events={[event]} />
        </div>
      )}
    </div>
  );
};

export default EventDetail;
