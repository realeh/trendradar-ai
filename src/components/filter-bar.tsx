"use client";

import { SlidersHorizontal } from "lucide-react";

export type SortKey = "trendScore" | "growth" | "category" | "country" | "platform";

export function FilterBar({
  sort,
  setSort,
  category,
  setCategory,
  country,
  setCountry,
  platform,
  setPlatform,
  categories,
  countries,
  platforms
}: {
  sort: SortKey;
  setSort: (value: SortKey) => void;
  category: string;
  setCategory: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  platform: string;
  setPlatform: (value: string) => void;
  categories: string[];
  countries: string[];
  platforms: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-black/10 bg-white/65 p-3 dark:border-white/10 dark:bg-white/6">
      <SlidersHorizontal size={18} className="text-coral" />
      <Select label="Sort" value={sort} onChange={(value) => setSort(value as SortKey)}>
        <option value="trendScore">Trend score</option>
        <option value="growth">Growth</option>
        <option value="category">Category</option>
        <option value="country">Country</option>
        <option value="platform">Platform</option>
      </Select>
      <Select label="Category" value={category} onChange={setCategory}>
        <option value="All">All categories</option>
        {categories.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <Select label="Country" value={country} onChange={setCountry}>
        <option value="All">All countries</option>
        {countries.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <Select label="Platform" value={platform} onChange={setPlatform}>
        <option value="All">All platforms</option>
        {platforms.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-bold">
      <span className="text-ink/55 dark:text-paper/55">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-black/10 bg-paper px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-ink"
      >
        {children}
      </select>
    </label>
  );
}
