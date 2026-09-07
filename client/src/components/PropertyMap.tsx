// ============================================================
// DESIGN: Google Maps centered on Algarve, Portugal
// Warm light map style, gold/green/rose AI-score markers
// ============================================================

import { useRef, useState, useCallback } from "react";
import { MapView } from "@/components/Map";
import { Property, PROPERTIES, formatPrice, getScoreHex } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  TrendingUp,
  X,
  ExternalLink,
} from "lucide-react";

// Algarve center — fits all 6 Portuguese properties
const ALGARVE_CENTER = { lat: 37.08, lng: -8.15 };
const INITIAL_ZOOM = 9;

function createMarkerSvg(score: number, color: string): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
      <defs>
        <filter id="shadow-${score}" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path d="M22 54 C22 54 4 34 4 20 C4 10.06 12.06 2 22 2 C31.94 2 40 10.06 40 20 C40 34 22 54 22 54Z"
        fill="${color}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" filter="url(#shadow-${score})"/>
      <circle cx="22" cy="20" r="13" fill="rgba(255,255,255,0.9)"/>
      <circle cx="22" cy="20" r="11" fill="none" stroke="${color}" stroke-width="1" stroke-opacity="0.3"/>
      <text x="22" y="24" text-anchor="middle" fill="${color}" font-size="11" font-weight="700" font-family="JetBrains Mono, monospace">${score}</text>
    </svg>
  `;
}

interface PropertyInfoProps {
  property: Property;
  onClose: () => void;
}

function PropertyInfoCard({ property, onClose }: PropertyInfoProps) {
  const scoreColor = getScoreHex(property.aiScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-4 left-4 right-4 z-10 p-4 max-w-sm rounded-xl"
      style={{
        background: "rgba(255, 253, 250, 0.97)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${scoreColor}33`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.12), 0 0 12px ${scoreColor}15`,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-3 right-3 w-6 h-6 rounded-md bg-black/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.1] transition-all"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={property.image}
            alt={property.address}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold font-mono px-1.5 py-0.5 rounded"
              style={{ color: scoreColor, background: `${scoreColor}18` }}
            >
              {property.aiScore}
            </span>
            <span
              className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                property.status === "active"
                  ? "bg-terra-green-dim text-terra-green"
                  : property.status === "pending"
                  ? "bg-gold-dim text-gold"
                  : "bg-black/5 text-black/40"
              }`}
            >
              {property.status}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-foreground truncate">
            {property.address}
          </h4>
          <p className="text-[11px] text-muted-foreground">
            {property.city}, {property.state}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.06]">
        <p className="text-lg font-bold text-foreground font-mono">
          {formatPrice(property.price)}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bed className="w-3 h-3" /> {property.beds}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3 h-3" /> {property.baths}
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="w-3 h-3" /> {property.sqft} m²
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-terra-green text-[11px]">
          <TrendingUp className="w-3 h-3" />
          <span className="font-mono font-medium">
            Save {formatPrice(property.commissionSavings)}
          </span>
        </div>
        <Link href={`/property/${property.id}`}>
          <span className="flex items-center gap-1 text-[11px] text-gold hover:underline cursor-pointer">
            View Details <ExternalLink className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

interface PropertyMapProps {
  className?: string;
  selectedPropertyId?: string | null;
  onPropertySelect?: (id: string | null) => void;
  properties?: Property[];
}

export default function PropertyMap({
  className,
  selectedPropertyId,
  onPropertySelect,
  properties,
}: PropertyMapProps) {
  const displayProperties = properties || PROPERTIES;
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  const handlePropertyClick = useCallback(
    (property: Property) => {
      setActiveProperty(property);
      onPropertySelect?.(property.id);
      if (mapRef.current) {
        mapRef.current.panTo({ lat: property.lat, lng: property.lng });
        mapRef.current.setZoom(11);
      }
    },
    [onPropertySelect]
  );

  const handleClose = useCallback(() => {
    setActiveProperty(null);
    onPropertySelect?.(null);
    if (mapRef.current) {
      mapRef.current.panTo(ALGARVE_CENTER);
      mapRef.current.setZoom(INITIAL_ZOOM);
    }
  }, [onPropertySelect]);

  const handleMapReady = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      // Warm light map style — matches the app aesthetic
      map.setOptions({
        styles: [
          { elementType: "geometry", stylers: [{ color: "#f5f0e8" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#f5f0e8" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#6b6560" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#4a4540" }],
          },
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#e0e8d0" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ede8df" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#ddd8cf" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#e5ddd0" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#d5cdc0" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#e8e2d8" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c5d8e8" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#8aa8c0" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
        },
      });

      // Clear existing markers
      markersRef.current.forEach((m) => (m.map = null));
      markersRef.current = [];

      // Create markers for each property
      displayProperties.forEach((property) => {
        const color = getScoreHex(property.aiScore);
        const svgString = createMarkerSvg(property.aiScore, color);

        const markerContent = document.createElement("div");
        markerContent.innerHTML = svgString;
        markerContent.style.cursor = "pointer";
        markerContent.style.transition = "transform 0.2s ease";

        markerContent.addEventListener("mouseenter", () => {
          markerContent.style.transform = "scale(1.15) translateY(-4px)";
        });
        markerContent.addEventListener("mouseleave", () => {
          markerContent.style.transform = "scale(1) translateY(0)";
        });

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: property.lat, lng: property.lng },
          content: markerContent,
          title: `${property.address} — AI Score: ${property.aiScore}`,
        });

        marker.addListener("click", () => {
          handlePropertyClick(property);
        });

        markersRef.current.push(marker);
      });
    },
    [handlePropertyClick]
  );

  return (
    <div className={`relative rounded-xl overflow-hidden ${className || ""}`}>
      <MapView
        className="w-full h-full !rounded-xl"
        initialCenter={ALGARVE_CENTER}
        initialZoom={INITIAL_ZOOM}
        onMapReady={handleMapReady}
      />

      {/* Map Legend */}
      <div className="absolute top-3 left-3 z-10 glass-card px-3 py-2.5 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-medium text-muted-foreground">AI Score:</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#2a9d6e" }} />
            <span className="text-[10px] text-muted-foreground">80+</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#DFB03A" }} />
            <span className="text-[10px] text-muted-foreground">60-79</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#c94040" }} />
            <span className="text-[10px] text-muted-foreground">&lt;60</span>
          </span>
        </div>
      </div>

      {/* Property count badge */}
      <div className="absolute top-3 right-3 z-10 glass-card px-2.5 py-1.5">
        <span className="text-[10px] font-mono text-muted-foreground">
          {displayProperties.length} properties
        </span>
      </div>

      {/* Info Card Overlay */}
      <AnimatePresence>
        {activeProperty && (
          <PropertyInfoCard
            property={activeProperty}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
