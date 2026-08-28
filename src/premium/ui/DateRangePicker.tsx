import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PremiumButton } from "./primitives";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date | null, b: Date | null) =>
  Boolean(a && b && startOfDay(a).getTime() === startOfDay(b).getTime());

/** Monday-first offset for the 1st of the given month. */
const leadingBlanks = (year: number, month: number) =>
  (new Date(year, month, 1).getDay() + 6) % 7;

const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const formatDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short"
      })
    : "";

interface MonthGridProps {
  year: number;
  month: number;
  range: DateRange;
  rangeMode: boolean;
  hovered: Date | null;
  onHover: (date: Date | null) => void;
  onSelect: (date: Date) => void;
}

const MonthGrid: React.FC<MonthGridProps> = ({
  year,
  month,
  range,
  rangeMode,
  hovered,
  onHover,
  onSelect
}) => {
  const today = startOfDay(new Date());
  const total = daysInMonth(year, month);
  const blanks = leadingBlanks(year, month);

  // While picking the return leg, preview the span under the cursor.
  const provisionalEnd =
    range.end ?? (rangeMode && range.start && hovered ? hovered : null);

  return (
    <div className="w-full">
      <p className="mb-4 text-center text-[15px] font-bold tracking-tight text-slate-900">
        {MONTHS[month]} {year}
      </p>

      <div className="mb-2 grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400"
          >
            {day.charAt(0)}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: blanks }).map((_, index) => (
          <span key={`blank-${index}`} />
        ))}

        {Array.from({ length: total }).map((_, index) => {
          const date = new Date(year, month, index + 1);
          const disabled = date < today;
          const isStart = isSameDay(date, range.start);
          const isEnd = isSameDay(date, provisionalEnd);
          const inRange =
            rangeMode &&
            range.start &&
            provisionalEnd &&
            date > startOfDay(range.start) &&
            date < startOfDay(provisionalEnd);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onMouseEnter={() => onHover(date)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(date)}
              className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-150 ${
                disabled
                  ? "cursor-not-allowed text-slate-300"
                  : isStart || isEnd
                    ? "bg-[var(--color-coral)] text-white shadow-md shadow-[var(--color-coral)]/30"
                    : inRange
                      ? "bg-[var(--color-coral)]/10 text-slate-900"
                      : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export interface DateRangePickerProps {
  value: DateRange;
  rangeMode: boolean;
  onChange: (range: DateRange) => void;
  onClose: () => void;
}

/**
 * Two-month calendar panel. Selecting a start date in range mode keeps the
 * panel open so the return leg can be chosen in the same gesture.
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  rangeMode,
  onChange,
  onClose
}) => {
  const initial = value.start ?? new Date();
  const [cursor, setCursor] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1)
  );
  const [hovered, setHovered] = useState<Date | null>(null);

  const nextMonth = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
    [cursor]
  );

  const shift = (months: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + months, 1));

  const handleSelect = (date: Date) => {
    if (!rangeMode) {
      onChange({ start: date, end: null });
      onClose();
      return;
    }

    // No start yet, or the click lands before it: restart the range.
    if (!value.start || value.end || date < startOfDay(value.start)) {
      onChange({ start: date, end: null });
      return;
    }

    onChange({ start: value.start, end: date });
    onClose();
  };

  return (
    <div className="w-[min(640px,calc(100vw-3rem))] rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.4)]">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <MonthGrid
          year={cursor.getFullYear()}
          month={cursor.getMonth()}
          range={value}
          rangeMode={rangeMode}
          hovered={hovered}
          onHover={setHovered}
          onSelect={handleSelect}
        />
        <div className="hidden sm:block">
          <MonthGrid
            year={nextMonth.getFullYear()}
            month={nextMonth.getMonth()}
            range={value}
            rangeMode={rangeMode}
            hovered={hovered}
            onHover={setHovered}
            onSelect={handleSelect}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-[13px] font-medium text-slate-500">
          {rangeMode
            ? value.start && !value.end
              ? "Now pick your return date"
              : "Select your travel dates"
            : "Select your travel date"}
        </p>
        <div className="flex gap-2">
          <PremiumButton
            variant="ghost"
            size="sm"
            onClick={() => onChange({ start: null, end: null })}
          >
            Clear
          </PremiumButton>
          <PremiumButton size="sm" onClick={onClose}>
            Done
          </PremiumButton>
        </div>
      </div>
    </div>
  );
};
