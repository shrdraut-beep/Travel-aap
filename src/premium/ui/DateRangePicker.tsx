import React from "react";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
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

export const formatDay = (date: Date | null) => (date ? String(date.getDate()) : "");

export const formatMonthYear = (date: Date | null) =>
  date
    ? date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "";

export const formatWeekday = (date: Date | null) =>
  date ? date.toLocaleDateString("en-IN", { weekday: "long" }) : "";

interface MonthGridProps {
  year: number;
  month: number;
  range: DateRange;
  rangeMode: boolean;
  onSelect: (date: Date) => void;
}

const MonthGrid: React.FC<MonthGridProps> = ({
  year,
  month,
  range,
  rangeMode,
  onSelect
}) => {
  const today = startOfDay(new Date());
  const total = daysInMonth(year, month);
  const blanks = leadingBlanks(year, month);

  return (
    <div className="px-4 py-5">
      <p className="mb-4 text-[15px] font-bold tracking-tight text-slate-900">
        {MONTHS[month]} {year}
      </p>

      <div className="grid grid-cols-7 gap-y-1.5">
        {Array.from({ length: blanks }).map((_, index) => (
          <span key={`blank-${index}`} />
        ))}

        {Array.from({ length: total }).map((_, index) => {
          const date = new Date(year, month, index + 1);
          const disabled = date < today;
          const isStart = isSameDay(date, range.start);
          const isEnd = isSameDay(date, range.end);
          const inRange =
            rangeMode &&
            range.start &&
            range.end &&
            date > startOfDay(range.start) &&
            date < startOfDay(range.end);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={`relative mx-auto flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-semibold transition-colors ${
                disabled
                  ? "cursor-not-allowed text-slate-300"
                  : isStart || isEnd
                    ? "bg-[var(--premium-accent)] text-white"
                    : inRange
                      ? "bg-[var(--premium-accent)]/10 text-slate-900"
                      : "text-slate-700 active:bg-slate-100"
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
  /** How many months to render below the current one. */
  monthsAhead?: number;
  onChange: (range: DateRange) => void;
  onClose: () => void;
}

/**
 * Scrolling month list, the pattern every mobile travel app uses: months stack
 * vertically and the sticky weekday header stays put while you scroll.
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  rangeMode,
  monthsAhead = 11,
  onChange,
  onClose
}) => {
  const base = new Date();

  const handleSelect = (date: Date) => {
    if (!rangeMode) {
      onChange({ start: date, end: null });
      onClose();
      return;
    }

    // No start yet, or the tap lands before it: restart the range.
    if (!value.start || value.end || date < startOfDay(value.start)) {
      onChange({ start: date, end: null });
      return;
    }

    onChange({ start: value.start, end: date });
  };

  return (
    <div>
      <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-slate-100 bg-white px-4 py-2.5">
        {WEEKDAYS.map((day, index) => (
          <span
            key={`${day}-${index}`}
            className="text-center text-[11px] font-bold uppercase tracking-wide text-slate-400"
          >
            {day}
          </span>
        ))}
      </div>

      {Array.from({ length: monthsAhead + 1 }).map((_, offset) => {
        const cursor = new Date(base.getFullYear(), base.getMonth() + offset, 1);
        return (
          <MonthGrid
            key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
            year={cursor.getFullYear()}
            month={cursor.getMonth()}
            range={value}
            rangeMode={rangeMode}
            onSelect={handleSelect}
          />
        );
      })}
    </div>
  );
};
