import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapThumbnail({ lat = 19.5124, lon = -98.8828, height = 'h-36', name = '' }) {
  return (
    <div className={`w-full ${height} bg-[#E3EDF7] relative overflow-hidden rounded-t-xl border-b border-[#E1E8F0]`}>
      {/* Stylized vector map background imitating Google Maps / Figma style */}
      <svg className="w-full h-full opacity-65" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`map-grid-${lat}-${lon}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D1E2F2" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#EAF2F9" />
        <rect width="100%" height="100%" fill={`url(#map-grid-${lat}-${lon})`} />
        
        {/* Soft roads / paths */}
        <path d="M -20 70 Q 120 40 280 90 T 500 50" fill="none" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M 120 -20 Q 160 100 140 220" fill="none" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M -10 120 Q 180 140 400 110" fill="none" stroke="#FFFFFF" strokeWidth="7" />
        
        {/* Soft green agricultural parcel patch */}
        <rect x="35%" y="22%" width="32%" height="48%" rx="8" fill="#D6EDDF" opacity="0.8" />
      </svg>

      {/* Center Plot Marker Pin */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-[#0B3D91] border-2 border-white shadow-md flex items-center justify-center animate-bounce-subtle">
            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
          </div>
          <div className="w-2.5 h-1 bg-black/20 rounded-full blur-[1px] mt-0.5"></div>
        </div>
      </div>

      {/* Coordinate badge in bottom right */}
      <div className="absolute bottom-2 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-[#4A5B73] shadow-2xs border border-white">
        {lat?.toFixed(4)}, {lon?.toFixed(4)}
      </div>
    </div>
  );
}
