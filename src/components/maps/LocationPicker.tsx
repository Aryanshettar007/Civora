"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Crosshair, Loader2, Search, MapPin } from "lucide-react";

const LIBRARIES: ("places")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
};

const defaultCenter = { lat: 12.9716, lng: 77.5946 };

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }, address: string) => void;
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [center, setCenter] = useState(defaultCenter);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Set up Places Autocomplete
  useEffect(() => {
    if (!isLoaded || !searchRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(searchRef.current, {
      types: ["geocode", "establishment"],
      fields: ["geometry", "formatted_address", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const loc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMarker(loc);
        setCenter(loc);
        const addr = place.formatted_address || place.name || "";
        setAddress(addr);
        onLocationSelect(loc, addr);
        mapRef.current?.panTo(loc);
        mapRef.current?.setZoom(17);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [isLoaded, onLocationSelect]);

  const reverseGeocode = useCallback(
    async (location: { lat: number; lng: number }) => {
      if (!isLoaded) return;
      try {
        const geocoder = new google.maps.Geocoder();
        const res = await geocoder.geocode({ location });
        if (res.results[0]) {
          const addr = res.results[0].formatted_address;
          setAddress(addr);
          onLocationSelect(location, addr);
        }
      } catch (err) {
        // Fallback: Use free Nominatim API to get real area/street names without Google Billing enabled
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          if (data.display_name) {
            setAddress(data.display_name);
            onLocationSelect(location, data.display_name);
            return;
          }
        } catch (nominatimErr) {
          console.error("Nominatim geocoding fallback failed:", nominatimErr);
        }

        const fallback = `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
        setAddress(fallback);
        onLocationSelect(location, fallback);
      }
    },
    [isLoaded, onLocationSelect]
  );

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMarker(userLoc);
        setCenter(userLoc);
        mapRef.current?.panTo(userLoc);
        mapRef.current?.setZoom(17);
        reverseGeocode(userLoc);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("Could not get your location. Please allow location access or search manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [reverseGeocode]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const loc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarker(loc);
        reverseGeocode(loc);
      }
    },
    [reverseGeocode]
  );

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // ── Fallback UI when Google Maps can't load (no billing / bad key) ──
  if (loadError) {
    return <FallbackLocationInput onLocationSelect={onLocationSelect} />;
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-surface border border-border flex items-center justify-center text-muted-foreground text-sm animate-pulse">
        Loading Google Maps…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + Current Location */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search for a location..."
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          {locating ? "Locating..." : "My Location"}
        </button>
      </div>

      {/* Google Map */}
      <div className="rounded-xl overflow-hidden border border-border">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          onClick={handleMapClick}
          onLoad={onLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [
              { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#8a8a9a" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#0f0f1a" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a3e" }] },
              { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a2e" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1a2b" }] },
              { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
            ],
          }}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      </div>

      {/* Selected address */}
      {address && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-surface/50 border border-border/50">
          <span className="text-sm">📍</span>
          <p className="text-sm text-foreground">{address}</p>
        </div>
      )}
    </div>
  );
}

// ── Fallback: Manual input with GPS button (shown when Maps fails to load) ──
function FallbackLocationInput({
  onLocationSelect,
}: {
  onLocationSelect: (location: { lat: number; lng: number }, address: string) => void;
}) {
  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(loc);
        // Use Nominatim as a free fallback geocoder
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}&zoom=18`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.display_name || `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
          setAddress(addr);
          onLocationSelect(loc, addr);
        } catch {
          const fallback = `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
          setAddress(fallback);
          onLocationSelect(loc, fallback);
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("Could not get your location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              onLocationSelect(coords || { lat: 0, lng: 0 }, e.target.value);
            }}
            placeholder="Enter the address of the issue..."
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          {locating ? "Locating..." : "My Location"}
        </button>
      </div>

      {/* Embedded Google Map (Embed API is free, no billing needed) */}
      {coords && (
        <div className="rounded-xl overflow-hidden border border-border">
          <iframe
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${coords.lat},${coords.lng}&zoom=17&maptype=roadmap`}
          />
        </div>
      )}

      {address && !coords && (
        <p className="text-xs text-muted-foreground">💡 Tip: Click "My Location" to auto-detect your GPS coordinates.</p>
      )}
    </div>
  );
}
