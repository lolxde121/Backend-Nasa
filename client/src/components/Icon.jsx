import {
  LayoutDashboard, Map, Globe, Sparkles, SlidersVertical, Search, Bell, Plus, ChevronRight, ChevronDown, ChevronUp, ChevronLeft,
  ArrowLeft, Thermometer, Droplet, CloudRain, Sun, Leaf, Check, X, MapPin, Download, RefreshCw, Pencil, Crosshair,
  TriangleAlert, Layers, User, Pentagon, TrendingUp, Trash2, AlignLeft, Calendar, Cloud, Sprout, ChartColumn, Lightbulb,
  Satellite,
} from 'lucide-react';

const MAP = {
  dash: LayoutDashboard, map: Map, globe: Globe, sparkles: Sparkles, sliders: SlidersVertical, search: Search, bell: Bell, plus: Plus,
  right: ChevronRight, down: ChevronDown, up: ChevronUp, left: ChevronLeft, back: ArrowLeft, thermo: Thermometer, drop: Droplet,
  rain: CloudRain, sun: Sun, leaf: Leaf, check: Check, x: X, pin: MapPin, download: Download, refresh: RefreshCw, pencil: Pencil,
  cross: Crosshair, warn: TriangleAlert, layers: Layers, user: User, poly: Pentagon, trend: TrendingUp, trash: Trash2, track: AlignLeft,
  calendar: Calendar, cloud: Cloud, sprout: Sprout, bars: ChartColumn, bulb: Lightbulb, satellite: Satellite,
};

export function Icon({ n, s = 18, cls = '', sw = 2 }) {
  const C = MAP[n] || Globe;
  return <C size={s} strokeWidth={sw} className={`shrink-0 ${cls}`} aria-hidden="true" />;
}
