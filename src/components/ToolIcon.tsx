import React from 'react';
import {
  Files,
  Scissors,
  LayoutGrid,
  FileImage,
  FilePlus2,
  Stamp,
  ShieldCheck,
  Minimize2,
  Scaling,
  RefreshCw,
  Crop,
  Pipette,
  Percent,
  Calculator,
  Landmark,
  CalendarDays,
  Receipt,
  BarChart3,
  Ruler,
  TableProperties,
  Binary,
  GitCompare,
  Braces,
  AlignLeft,
  CaseSensitive,
  FolderArchive,
  Fingerprint,
  FileText,
  Image,
  ArrowLeftRight,
  Code2,
  Wrench,
} from 'lucide-react';

interface ToolIconProps {
  name: string;
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Files,
  Scissors,
  LayoutGrid,
  FileImage,
  FilePlus2,
  Stamp,
  ShieldCheck,
  Minimize2,
  Scaling,
  RefreshCw,
  Crop,
  Pipette,
  Percent,
  Calculator,
  Landmark,
  CalendarDays,
  Receipt,
  BarChart3,
  Ruler,
  TableProperties,
  Binary,
  GitCompare,
  Braces,
  AlignLeft,
  CaseSensitive,
  FolderArchive,
  Fingerprint,
  FileText,
  Image,
  ArrowLeftRight,
  Code2,
};

export function ToolIcon({ name, className = 'w-5 h-5' }: ToolIconProps) {
  const IconComponent = ICON_MAP[name] || Wrench;
  return <IconComponent className={className} />;
}
