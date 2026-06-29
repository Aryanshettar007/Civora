"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Map, Trophy, LogOut, Plus, MapPin, BrainCircuit, CheckCircle, Navigation } from "lucide-react";
import Link from "next/link";

interface MapIssue {
  _id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  imageUrl: string;
  resolvedImageUrl?: string;
  aiAnalysis?: {
    reasoning: string;
  };
  createdAt: string;
  resolvedAt?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "65vh",
  borderRadius: "16px",
};

const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Default center (Bangalore)

export default function MapExplorerPage() {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState<MapIssue[]>([]);
  const [activeIssue, setActiveIssue] = useState<MapIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues/map");
      const data = await res.json();
      if (data.success) {
        setIssues(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch map issues", error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerIcon = (status: string) => {
    const colorMap: Record<string, string> = {
      Pending: "red-dot.png",
      Verified: "red-dot.png",
      "In Progress": "yellow-dot.png",
      Resolved: "green-dot.png",
      Closed: "blue-dot.png",
    };
    return `https://maps.google.com/mapfiles/ms/icons/${colorMap[status] || "red-dot.png"}`;
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Dynamically adjust map bounds to fit markers whenever issues are loaded/updated
  useEffect(() => {
    if (isLoaded && mapRef.current && issues.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidCoords = false;

      issues.forEach((issue) => {
        if (issue.location && typeof issue.location.lat === "number" && typeof issue.location.lng === "number") {
          bounds.extend(new window.google.maps.LatLng(issue.location.lat, issue.location.lng));
          hasValidCoords = true;
        }
      });

      if (hasValidCoords) {
        mapRef.current.fitBounds(bounds);
        
        // Prevent zooming in too close if there is only 1 marker
        const listener = window.google.maps.event.addListener(mapRef.current, "idle", () => {
          if (mapRef.current && mapRef.current.getZoom()! > 15) {
            mapRef.current.setZoom(15);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  }, [issues, isLoaded]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Neighborhood Map</h1>
          <p className="text-muted-foreground">Interactive explorer showing verified civic reports and resolutions near you.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/report">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </Link>
          <Button onClick={logout} variant="ghost" size="sm" className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border/60 gap-8 text-sm">
        <Link 
          href="/citizen/dashboard" 
          className="pb-3 text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-border transition-all flex items-center gap-1.5"
        >
          <Clock className="w-4 h-4" />
          Feed & Reports
        </Link>
        <Link 
          href="/citizen/map" 
          className="pb-3 border-b-2 border-blue-500 font-semibold text-blue-400 flex items-center gap-1.5"
        >
          <Map className="w-4 h-4" />
          Neighborhood Map
        </Link>
        <Link 
          href="/citizen/leaderboard" 
          className="pb-3 text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-border transition-all flex items-center gap-1.5"
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </Link>
      </div>

      {/* Map Explorer Area */}
      <div className="relative">
        {loading || !isLoaded ? (
          <div className="h-[65vh] w-full rounded-2xl bg-surface/30 border border-border flex items-center justify-center animate-pulse">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading neighborhood map...</p>
            </div>
          </div>
        ) : loadError ? (
          <div className="h-[65vh] w-full rounded-2xl bg-red-950/10 border border-red-500/20 flex items-center justify-center">
            <p className="text-red-400 font-medium">Failed to load Google Maps interface. Please check connectivity.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={13}
              onLoad={onMapLoad}
              onUnmount={onMapUnmount}
              options={{
                styles: [
                  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                  {
                    featureType: "administrative.locality",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#d59563" }],
                  },
                  {
                    featureType: "poi",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#d59563" }],
                  },
                  {
                    featureType: "poi.park",
                    elementType: "geometry",
                    stylers: [{ color: "#263c3f" }],
                  },
                  {
                    featureType: "poi.park",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#6b9a76" }],
                  },
                  {
                    featureType: "road",
                    elementType: "geometry",
                    stylers: [{ color: "#38414e" }],
                  },
                  {
                    featureType: "road",
                    elementType: "geometry.stroke",
                    stylers: [{ color: "#212a37" }],
                  },
                  {
                    featureType: "road",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#9ca5b9" }],
                  },
                  {
                    featureType: "road.highway",
                    elementType: "geometry",
                    stylers: [{ color: "#746855" }],
                  },
                  {
                    featureType: "road.highway",
                    elementType: "geometry.stroke",
                    stylers: [{ color: "#1f282f" }],
                  },
                  {
                    featureType: "road.highway",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#f3d19c" }],
                  },
                  {
                    featureType: "transit",
                    elementType: "geometry",
                    stylers: [{ color: "#2f3942" }],
                  },
                  {
                    featureType: "transit.station",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#d59563" }],
                  },
                  {
                    featureType: "water",
                    elementType: "geometry",
                    stylers: [{ color: "#17263c" }],
                  },
                  {
                    featureType: "water",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#515c6d" }],
                  },
                  {
                    featureType: "water",
                    elementType: "labels.text.stroke",
                    stylers: [{ color: "#17263c" }],
                  },
                ],
                disableDefaultUI: false,
                zoomControl: true,
              }}
            >
              {issues.map((issue) => (
                <Marker
                  key={issue._id}
                  position={{ lat: issue.location.lat, lng: issue.location.lng }}
                  icon={getMarkerIcon(issue.status)}
                  onClick={() => setActiveIssue(issue)}
                />
              ))}

              {activeIssue && (
                <InfoWindow
                  position={{ lat: activeIssue.location.lat, lng: activeIssue.location.lng }}
                  onCloseClick={() => setActiveIssue(null)}
                >
                  <div className="p-1 max-w-[280px] text-zinc-900 space-y-3 font-sans">
                    <img 
                      src={activeIssue.imageUrl} 
                      alt={activeIssue.title} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm text-zinc-900 line-clamp-1">{activeIssue.title}</h4>
                        <Badge className="bg-zinc-800 text-white border-none text-[9px] py-0 px-1 hover:bg-zinc-700">
                          {activeIssue.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span className="line-clamp-1">{activeIssue.address}</span>
                      </p>
                    </div>

                    {activeIssue.aiAnalysis?.reasoning && (
                      <div className="bg-zinc-100 p-2 rounded-md text-[10px] text-zinc-600 flex items-start gap-1">
                        <BrainCircuit className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">CORA: {activeIssue.aiAnalysis.reasoning}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${activeIssue.location.lat},${activeIssue.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full h-7 text-[10px] bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center gap-1">
                          <Navigation className="w-3 h-3" />
                          Navigate
                        </Button>
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        )}
      </div>

      {/* Color Code Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 p-4 rounded-xl border border-border/40 bg-surface/30 text-xs">
        <span className="font-semibold text-muted-foreground">Map Pins:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          <span>Verified / Pending</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
          <span>In Progress</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          <span>Resolved</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span>Closed / Graded</span>
        </span>
      </div>
    </div>
  );
}
