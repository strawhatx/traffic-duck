import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  selectedPlatform: string;
  selectedIntent: string;
  onPlatformChange: (value: string) => void;
  onIntentChange: (value: string) => void;
}

export function FilterBar({
  selectedPlatform,
  selectedIntent,
  onPlatformChange,
  onIntentChange,
}: FilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <div className="flex gap-4">
        <div className="w-56">
          <label className="block text-xs text-gray-600 mb-1">Platform</label>
          <Select value={selectedPlatform} onValueChange={onPlatformChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Platforms">All Platforms</SelectItem>
              <SelectItem value="X">X</SelectItem>
              <SelectItem value="Reddit">Reddit</SelectItem>
              <SelectItem value="Hacker News">Hacker News</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-56">
          <label className="block text-xs text-gray-600 mb-1">Intent</label>
          <Select value={selectedIntent} onValueChange={onIntentChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Levels">All Levels</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}


