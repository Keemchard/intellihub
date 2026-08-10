import {
  Home, Grid3x3, ShieldCheck, Sparkles, Search, Bell, MessageSquare, HelpCircle,
  Moon, Sun, ChevronLeft, ChevronRight, ChevronDown, LogOut, User, Settings, Briefcase,
  Gauge, MapPin, LayoutGrid, Smile, Database, Activity, BarChart3, ExternalLink, Star,
  TrendingUp, TrendingDown, CheckCircle2, Clock, ArrowRight, Layers, BadgeCheck, Tag,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  home: Home, grid: Grid3x3, "shield-check": ShieldCheck, sparkles: Sparkles, search: Search,
  bell: Bell, "message-square": MessageSquare, "help-circle": HelpCircle, moon: Moon, sun: Sun,
  "chevron-left": ChevronLeft, "chevron-right": ChevronRight, "chevron-down": ChevronDown,
  "log-out": LogOut, user: User, settings: Settings, briefcase: Briefcase,
  gauge: Gauge, "map-pin": MapPin, "layout-grid": LayoutGrid, smile: Smile, database: Database,
  activity: Activity, "bar-chart-3": BarChart3, "external-link": ExternalLink, star: Star,
  "trending-up": TrendingUp, "trending-down": TrendingDown, "check-circle": CheckCircle2,
  clock: Clock, "arrow-right": ArrowRight, layers: Layers, "badge-check": BadgeCheck, tag: Tag,
};

export function Icon({ name, className, size = 18 }: { name: string; className?: string; size?: number }) {
  const C = MAP[name] ?? Grid3x3;
  return <C className={className} size={size} />;
}
