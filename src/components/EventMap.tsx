import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Event } from '../types/Event';

// Mapbox tokenı .env veya backend üzerinden güvenli şekilde alınmalı
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface EventMapProps {
  events: Event[];
  userLocation?: { lat: number; lng: number };
}

const EventMap: React.FC<EventMapProps> = ({ events, userLocation }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [28.9784, 41.0082], // İstanbul default
      zoom: userLocation ? 11 : 6,
    });
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Önceki markerları temizle
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Etkinlik markerları ekle
    events.forEach((event, idx) => {
      if (!event.location_lat || !event.location_lng) return;
      const el = document.createElement('div');
      el.className = 'event-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.background = 'rgba(59,130,246,0.8)';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.title = event.title;
      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.location_lng, event.location_lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${event.title}</strong><br/>${event.location}`))
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // Kullanıcı lokasyonu
    if (userLocation) {
      const el = document.createElement('div');
      el.className = 'user-marker';
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.background = 'rgba(16,185,129,0.8)';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.title = 'Siz';
      const marker = new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Siz</strong>`))
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    }
  }, [events, userLocation]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border mt-6" ref={mapContainer} />
  );
};

export default EventMap;
