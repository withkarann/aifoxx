import {
  Rocket,
  Pencil,
  Code,
  PaintBrush,
  Image,
  VideoCamera,
  MusicNote,
  Megaphone,
  Handshake,
  Clipboard,
  MagnifyingGlass,
  ChatText,
  ChartBar,
  Users,
  BookOpen,
  FirstAid,
  Scales,
  CurrencyDollar,
  ShoppingCart,
  Globe,
  ShieldCheck,
  GearSix,
  ShareNetwork,
  Buildings,
  ListChecks,
  Database,
} from "phosphor-react";
import { normalizeTaxonomyValue } from "./tools";

type IconComp = typeof Rocket;

const RAW_MAP: Record<string, IconComp> = {
  "AI Assistants": Rocket,
  "Content Creation": Pencil,
  Coding: Code,
  Design: PaintBrush,
  "Image Generation": Image,
  Video: VideoCamera,
  "Audio & Music": MusicNote,
  Marketing: Megaphone,
  "Sales & CRM": Handshake,
  Productivity: Clipboard,
  Research: MagnifyingGlass,
  "Customer Support": ChatText,
  "Data & Analytics": ChartBar,
  "HR & Recruitment": Users,
  Education: BookOpen,
  Healthcare: FirstAid,
  Legal: Scales,
  Finance: CurrencyDollar,
  "E-commerce": ShoppingCart,
  "Translation & Language": Globe,
  Security: ShieldCheck,
  "Agentic & Automation": GearSix,
  "Social Media": ShareNetwork,
  "Real Estate": Buildings,
  "Project Management": ListChecks,
  Data: Database,
};

const ICON_MAP: Record<string, IconComp> = Object.entries(RAW_MAP).reduce((acc, [display, icon]) => {
  acc[normalizeTaxonomyValue(display)] = icon;
  return acc;
}, {} as Record<string, IconComp>);

ICON_MAP.__default__ = RAW_MAP["AI Assistants"] ?? Rocket;

export function getCategoryIcon(category: string): IconComp | null {
  if (!category) return null;
  const key = normalizeTaxonomyValue(category);
  return (ICON_MAP[key] as IconComp) ?? ICON_MAP.__default__;
}

export default ICON_MAP;
