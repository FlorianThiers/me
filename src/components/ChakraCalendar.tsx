import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

// Chakra data structure
const CHAKRAS = {
  root: {
    name: 'Wortelchakra',
    englishName: 'Root Chakra',
    color: '#dc2626', // red-600
    theme: 'Veiligheid',
    question: 'Waar voel ik me vandaag veilig en gegrond?'
  },
  sacral: {
    name: 'Sacraalchakra',
    englishName: 'Sacral Chakra',
    color: '#ea580c', // orange-600
    theme: 'Creativiteit',
    question: 'Hoe kan ik vandaag mijn creativiteit uiten?'
  },
  solarPlexus: {
    name: 'Zonnevlechtchakra',
    englishName: 'Solar Plexus Chakra',
    color: '#ca8a04', // yellow-600
    theme: 'Persoonlijke kracht',
    question: 'Waar neem ik vandaag verantwoordelijkheid voor?'
  },
  heart: {
    name: 'Hartchakra',
    englishName: 'Heart Chakra',
    color: '#16a34a', // green-600
    theme: 'Verbinding',
    question: 'Waar sluit ik me vandaag voor af?'
  },
  throat: {
    name: 'Keelchakra',
    englishName: 'Throat Chakra',
    color: '#2563eb', // blue-600
    theme: 'Expressie',
    question: 'Hoe geef ik vandaag mijn waarheid vorm?'
  },
  thirdEye: {
    name: 'Derde oog chakra',
    englishName: 'Third Eye Chakra',
    color: '#7c3aed', // violet-600
    theme: 'Intuïtie',
    question: 'Welke inzichten komen vandaag naar voren?'
  },
  crown: {
    name: 'Kruinchakra',
    englishName: 'Crown Chakra',
    color: '#7c2d12', // stone-700 (dark purple/brown)
    theme: 'Eenheid',
    question: 'Hoe kan ik vandaag verbinding maken met het grotere geheel?'
  }
};

// Day of week mapping to chakras (1-7 cycle)
const DAY_TO_CHAKRA = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'] as const;

// Month names for 13-month calendar
const MONTH_NAMES = [
  'Rood Maan', 'Vuur Maan', 'Kristal Maan', 'Hemel Maan', 'Storm Maan',
  'Zon Maan', 'Wind Maan', 'Aarde Maan', 'Zaad Maan', 'Serpent Maan',
  'Schaal Maan', 'Mens Maan', 'Dag Uit de Tijd'
];

interface DayData {
  dayOfMonth: number;
  dayOfWeek: number;
  chakra: keyof typeof CHAKRAS;
  gregorianDate?: Date;
  isDayOutOfTime?: boolean;
}

interface MonthData {
  name: string;
  days: DayData[];
}

export const ChakraCalendar: React.FC = () => {
  // Calculate current date and month
  const today = new Date();
  const currentYear = today.getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showGregorianOverlay, setShowGregorianOverlay] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Find which 13-moon month we're currently in
  const currentMonthData = useMemo(() => {
    const startDate = new Date(currentYear, 6, 26); // July 26th
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentMonthIndex = Math.floor(daysSinceStart / 28) % 13;
    return { monthIndex: currentMonthIndex, daysSinceStart };
  }, [currentYear]);

  // Generate calendar data for the selected year
  const calendarData = useMemo((): MonthData[] => {
    const months: MonthData[] = [];
    // Start from July 26th (traditional 13-moon calendar start date)
    const startDate = new Date(selectedYear, 6, 26); // July 26th (month 6 = July, day 26)
    let gregorianDayOffset = 0;

    for (let monthIndex = 0; monthIndex < 13; monthIndex++) {
      const month: MonthData = {
        name: MONTH_NAMES[monthIndex],
        days: []
      };

      const isDayOutOfTime = monthIndex === 12;
      const daysInMonth = isDayOutOfTime ? 1 : 28;

      for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
        // Calculate day of week (1-7 cycle)
        const totalDaysElapsed = monthIndex * 28 + dayOfMonth - 1;
        const dayOfWeek = (totalDaysElapsed % 7) + 1; // 1-7

        // Map to chakra
        const chakraIndex = dayOfWeek - 1; // 0-6
        const chakra = DAY_TO_CHAKRA[chakraIndex];

        const dayData: DayData = {
          dayOfMonth,
          dayOfWeek,
          chakra,
          isDayOutOfTime
        };

        // Add Gregorian date mapping (only for regular days)
        if (!isDayOutOfTime) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + gregorianDayOffset);
          dayData.gregorianDate = new Date(currentDate);
          gregorianDayOffset++;
        }

        month.days.push(dayData);
      }

      months.push(month);
    }

    return months;
  }, [selectedYear]);

  const formatGregorianDate = (date: Date): string => {
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get month abbreviation for Gregorian overlay
  const getMonthAbbrev = (date: Date): string => {
    return date.toLocaleDateString('nl-NL', { month: 'short' });
  };

  // Check if a day is today
  const isToday = (gregorianDate: Date | undefined): boolean => {
    if (!gregorianDate) return false;
    return gregorianDate.toDateString() === today.toDateString();
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Chakra Kalender</h2>
          <p className="text-white/70">
            Een alternatieve manier om tijd, focus en ritme te visualiseren • Startdatum: 26 juli
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-dark-secondary border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-green focus:outline-none"
          >
            {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Overlay toggle */}
          <button
            onClick={() => setShowGregorianOverlay(!showGregorianOverlay)}
            className="flex items-center gap-2 bg-dark-secondary border border-white/20 rounded-lg px-3 py-2 text-white/70 hover:text-white hover:border-neon-green/50 transition-colors text-sm"
          >
            {showGregorianOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showGregorianOverlay ? 'Verberg' : 'Toon'} Gregoriaans
          </button>
        </div>
      </div>

      {/* Current Month Display */}
      <div className="max-w-md mx-auto">
        {calendarData.filter((_, index) => index === currentMonthData.monthIndex).map((month, monthIndex) => (
          <motion.div
            key={month.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: monthIndex * 0.1 }}
            className="bg-dark-secondary/30 backdrop-blur-sm border border-white/10 rounded-xl p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-2 text-center">
              {month.name} ({currentYear})
            </h3>
            <p className="text-center text-white/60 text-sm mb-4">
              Huidige maand • Dag {currentMonthData.daysSinceStart % 28 + 1} van 28
            </p>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {/* Day headers */}
              {['R', 'S', 'Z', 'H', 'K', 'D', 'K'].map((day, i) => (
                <div key={i} className="text-center text-xs text-white/50 font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {month.days.map((day, dayIndex) => {
                const chakraData = CHAKRAS[day.chakra];
                const isHovered = hoveredDay === day;
                const dayIsToday = isToday(day.gregorianDate);

                return (
                  <motion.div
                    key={dayIndex}
                    className={`relative aspect-square rounded-lg cursor-pointer transition-all duration-200 border ${
                      day.isDayOutOfTime
                        ? 'border-white/20 bg-white/5 col-span-7'
                        : dayIsToday
                        ? 'border-neon-green bg-neon-green/20 shadow-lg shadow-neon-green/30'
                        : `border-white/10 hover:border-white/30`
                    }`}
                    style={{
                      backgroundColor: day.isDayOutOfTime
                        ? 'rgba(255, 255, 255, 0.05)'
                        : dayIsToday
                        ? `${chakraData.color}30` // More visible for today
                        : `${chakraData.color}15`, // Very subtle chakra color
                    }}
                    whileHover={{ scale: day.isDayOutOfTime ? 1 : 1.05 }}
                    onHoverStart={() => setHoveredDay(day)}
                    onHoverEnd={() => setHoveredDay(null)}
                    onClick={() => setSelectedDay(day)}
                  >
                    {/* Day number */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs font-medium ${
                        day.isDayOutOfTime ? 'text-white/70' : 'text-white'
                      }`}>
                        {day.isDayOutOfTime ? '∞' : day.dayOfMonth}
                      </span>
                    </div>

                    {/* Gregorian overlay */}
                    {showGregorianOverlay && day.gregorianDate && (
                      <div className="absolute -top-1 -right-1 bg-black/70 backdrop-blur-sm rounded px-1 py-0.5 text-xs text-white/70 border border-white/20">
                        {day.gregorianDate.getDate()}{getMonthAbbrev(day.gregorianDate)}
                      </div>
                    )}

                    {/* Hover indicator */}
                    <AnimatePresence>
                      {isHovered && !day.isDayOutOfTime && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 rounded-lg border-2 border-neon-green/50"
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Day Detail Panel */}
      <AnimatePresence>
        {(hoveredDay || selectedDay) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 max-w-2xl mx-auto"
          >
            {(() => {
              const day = selectedDay || hoveredDay;
              if (!day) return null;

              const chakraData = CHAKRAS[day.chakra];

              return (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center"
                      style={{ borderColor: chakraData.color }}
                    >
                      <span className="text-lg font-bold" style={{ color: chakraData.color }}>
                        {day.isDayOutOfTime ? '∞' : day.dayOfWeek}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {day.isDayOutOfTime ? 'Dag Uit de Tijd / Nieuwjaarsdag' : chakraData.name}
                      </h3>
                      <p className="text-white/70">{day.isDayOutOfTime ? 'Nieuwe cyclus' : chakraData.englishName}</p>
                    </div>
                  </div>

                  {!day.isDayOutOfTime && (
                    <>
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 mb-2">
                          Thema: {chakraData.theme}
                        </span>
                      </div>

                      <p className="text-white/70 italic mb-4">
                        "{chakraData.question}"
                      </p>

                      {day.gregorianDate && (
                        <p className="text-sm text-white/50">
                          Gregoriaanse datum: {formatGregorianDate(day.gregorianDate)}
                        </p>
                      )}
                    </>
                  )}

                  {day.isDayOutOfTime && (
                    <p className="text-white/70">
                      Een dag buiten de tijd - een moment om te reflecteren en de nieuwe cyclus te beginnen.
                    </p>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-8 text-center">
        <h4 className="text-lg font-semibold text-white mb-4">Chakra Legende</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-4xl mx-auto">
          {Object.entries(CHAKRAS).map(([key, chakra]) => (
            <div key={key} className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full mb-2 border border-white/20"
                style={{ backgroundColor: `${chakra.color}20` }}
              />
              <span className="text-xs text-white/70 text-center">{chakra.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
