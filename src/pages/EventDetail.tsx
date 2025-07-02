import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, MapPin, Users, User, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getUser } from "@/utils/auth";

const EventDetail = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const eventId = Number(id);
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single();
      if (error) setError(error);
      setEvent(data);
      setLoading(false);
      console.log("[DEBUG] event:", data);
    })();
    (async () => {
      const u = await getUser();
      setUser(u);
      console.log("[DEBUG] user:", u);
    })();
  }, [id]);

  useEffect(() => {
    if (event) fetchAttendees();
    // eslint-disable-next-line
  }, [event]);

  const fetchAttendees = async () => {
    if (!event) return;
    const { data: attendeeRows, error } = await supabase
      .from("event_attendees")
      .select("*, users:user_id(id,email,avatar_url)")
      .eq("event_id", event.id);
    if (error) {
      console.error('fetchAttendees error:', error.message);
      setAttendees([]);
    } else {
      setAttendees(attendeeRows || []);
    }
  };


  const isOrganizer = event && user && (event.organizer === user.email);
  console.log("[DEBUG] isOrganizer:", isOrganizer, "event.organizer:", event && event.organizer, "user.email:", user && user.email);

  const handleDeleteEvent = async () => {
    if (!window.confirm("Etkinliği silmek istediğinizden emin misiniz?")) return;
    await supabase.from("events").delete().eq("id", event.id);
    navigate("/");
  };

  const handleApprove = async (userId: string) => {
    await supabase.from("event_attendees").update({ status: "approved" }).match({ event_id: event.id, user_id: userId });
    fetchAttendees();
  };
  const handleReject = async (userId: string) => {
    await supabase.from("event_attendees").update({ status: "rejected" }).match({ event_id: event.id, user_id: userId });
    fetchAttendees();
  };


  if (loading) {
    return <div className="text-center py-20 text-lg text-white">Yükleniyor...</div>;
  }
  if (error || !event) {
    return (
      <div className="text-center py-20 text-red-500">
        Etkinlik bulunamadı.<br />
        <span className="text-xs text-gray-400">(Supabase Hatası: {error?.message})</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#7B6CF6] to-[#5FD2F3] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {isOrganizer && (
          <div className="flex gap-2 mb-4">
            <Button onClick={() => navigate(`/event/edit/${event.id}`)} variant="outline">Etkinliği Düzenle</Button>
            <Button onClick={handleDeleteEvent} variant="destructive">Etkinliği Sil</Button>
          </div>
        )}
        {/* Ana Etkinlik Kartı */}
        <Card className="bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-8">
                {event.title}
              </h1>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-6 py-3 text-base bg-blue-500 text-white hover:bg-blue-600 rounded-full transition-all duration-300 hover:scale-105">
                  <Calendar className="w-5 h-5 mr-2" />
                  {event.date} {event.time}
                </Badge>
                <Badge variant="secondary" className="px-6 py-3 text-base bg-blue-500 text-white hover:bg-blue-600 rounded-full transition-all duration-300 hover:scale-105">
                  <MapPin className="w-5 h-5 mr-2" />
                  {event.location?.split(",").pop() || "Konum"}
                </Badge>
                <Badge variant="secondary" className="px-6 py-3 text-base bg-blue-500 text-white hover:bg-blue-600 rounded-full transition-all duration-300 hover:scale-105">
                  <Users className="w-5 h-5 mr-2" />
                  Maks. {event.maxAttendees || "-"} kişi
                </Badge>
              </div>
              <Badge variant="outline" className="px-6 py-3 text-base border-orange-300 text-orange-700 bg-orange-50 rounded-full">
                <Mail className="w-5 h-5 mr-2" />
                {event.organizerEmail || "email yok"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Açıklama Kartı */}
          <div className="rounded-2xl p-6 shadow-lg" style={{ background: '#F5F6FB' }}>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>Açıklama</h3>
            <p className="text-gray-700">{event.description}</p>
          </div>
          {/* Etkinlik Detayları Kartı */}
          <div className="rounded-2xl p-6 shadow-lg" style={{ background: '#F2FBFA' }}>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Etkinlik Detayları</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700"><Calendar className="w-5 h-5" /> {event.date} {event.time}</div>
              <div className="flex items-center gap-2 text-gray-700"><MapPin className="w-5 h-5" /> {event.location}</div>
              <div className="flex items-center gap-2 text-gray-700"><Users className="w-5 h-5" /> Maksimum {event.maxAttendees || '-'} kişi</div>
            </div>
          </div>
          {/* Organizatör Kartı */}
          <div className="rounded-2xl p-6 shadow-lg" style={{ background: '#F8F3FC' }}>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><span className="w-3 h-3 rounded-full bg-pink-500 mr-2"></span>Organizatör</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800">{event.organizerEmail || 'Bilinmiyor'}</p>
                <p className="text-gray-500 text-sm">Etkinlik ile ilgili sorularınız için organizatör ile iletişime geçebilirsiniz.</p>
              </div>
            </div>
            <Button className="mt-2 bg-gradient-to-r from-[#7B6CF6] to-[#5FD2F3] text-white rounded-full px-6 py-2">İletişime Geç</Button>
          </div>
        </div>

        {/* Katılım Butonu */}
        <div className="flex justify-center mt-10">
          <Button
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Katılım İsteği Gönder
          </Button>
        </div>

        {/* Katılımcı Onay Paneli */}
        {isOrganizer && (
          <div className="mt-6">
            <h4 className="font-bold mb-2">Onay Bekleyen Katılımcılar</h4>
            {attendees.filter((a: any) => a.status === 'pending').length === 0 ? (
              <div className="text-gray-500 text-sm">Bekleyen talep yok.</div>
            ) : (
              attendees.filter((a: any) => a.status === 'pending').map((a: any) => (
                <div key={a.user_id} className="flex items-center gap-2 mb-2">
                  <span>{a.users?.email || a.user_id}</span>
                  <Button size="sm" onClick={() => handleApprove(a.user_id)} className="bg-green-600 text-white">Onayla</Button>
                  <Button size="sm" onClick={() => handleReject(a.user_id)} className="bg-red-600 text-white">Reddet</Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
