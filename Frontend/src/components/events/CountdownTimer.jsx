import React, { useCallback, useEffect, useState } from "react";
import { Clock, Timer, Sparkles } from "lucide-react";

/**
 * CountdownTimer
 * Ultra-premium glassmorphic countdown timer component for event registration.
 */
const CountdownTimer = ({ eventDate }) => {
  const calculateTimeLeft = useCallback(() => {
    if (!eventDate) return null;
    const difference = new Date(eventDate) - new Date();

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [eventDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (!timeLeft) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 text-center py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm mt-4 shadow-xs flex items-center justify-center gap-2">
        <Clock size={16} />
        <span>Event In Progress or Registration Concluded</span>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-50/80 via-white to-purple-50/80 border border-purple-100 rounded-2xl p-4 sm:p-5 mt-6 shadow-sm">
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#6A38C2] uppercase tracking-wider mb-3">
        <Timer size={14} className="text-pink-500 animate-spin" style={{ animationDuration: "12s" }} />
        <span>Registration Countdown • Event Starts In</span>
        <Sparkles size={13} className="text-amber-500" />
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="bg-white/95 rounded-xl border border-purple-100 shadow-xs p-2 sm:p-3 text-center"
          >
            <p className="text-xl sm:text-3xl font-black text-gray-900 font-mono tracking-tight leading-none">
              {String(unit.value).padStart(2, "0")}
            </p>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-600/80 mt-1 block">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;