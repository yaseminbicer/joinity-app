import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, MapPin, Users, User, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EventDetail = () => {
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
    })();
  }, [id]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Ana Etkinlik Kartı */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
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

        {/* Alt Kartlar */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Açıklama Kartı */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></div>
                Açıklama
              </h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-700">{event.description}</h3>
                <p className="text-slate-600 leading-relaxed">
                  Bu etkinlik hakkında daha fazla bilgi için organizatör ile iletişime geçebilirsiniz.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Etkinlik Detayları Kartı */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-blue-600 rounded-full mr-3"></div>
                Etkinlik Detayları
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-slate-700 font-medium">{event.date} {event.time}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-700">{event.location?.split(',')[0]}</p>
                      <p className="text-slate-600 text-sm">{event.location?.split(',')[1]}</p>
                      <p className="text-slate-600 text-sm">{event.location?.split(',')[2]}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className="text-slate-700 font-medium">Maksimum {event.maxAttendees || "-"} kişi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizatör Kartı */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <div className="w-3 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></div>
                Organizatör
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{event.organizerEmail}</p>
                    <p className="text-slate-600 text-sm">{event.organizerEmail}</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Etkinlik ile ilgili sorularınız için organizatör ile iletişime geçebilirsiniz.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Katılım Butonu */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Katılım İsteği Gönder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
