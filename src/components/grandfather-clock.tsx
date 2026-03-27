import { useState, useEffect } from "react";

export const GrandfatherClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = hours * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  return (
    <div className="flex flex-col items-center">
      {/* Ornate top crown */}
      <div className="relative">
        {/* Crown finial */}
        <div className="flex justify-center mb-1">
          <div className="w-3 h-6 bg-clock-wood-dark rounded-t-full border border-clock-trim/30" />
        </div>
        {/* Arched pediment */}
        <div className="w-52 sm:w-64 h-6 bg-clock-wood-dark rounded-t-[50%] border-t-2 border-x-2 border-clock-trim/40" />
      </div>

      {/* Clock head / hood */}
      <div className="relative w-52 sm:w-64 bg-clock-wood border-x-4 border-clock-wood-dark px-4 pt-4 pb-3">
        {/* Decorative columns */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-clock-wood-dark flex flex-col justify-between items-center py-2">
          <div className="w-2 h-2 rounded-full bg-clock-trim/50" />
          <div className="w-2 h-2 rounded-full bg-clock-trim/50" />
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-clock-wood-dark flex flex-col justify-between items-center py-2">
          <div className="w-2 h-2 rounded-full bg-clock-trim/50" />
          <div className="w-2 h-2 rounded-full bg-clock-trim/50" />
        </div>

        {/* Clock face */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-full bg-clock-face border-4 border-clock-bezel shadow-inner">
          {/* Hour markers */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const r = 42;
            const x = 50 + r * Math.cos(angle);
            const y = 50 + r * Math.sin(angle);
            const roman = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
            return (
              <span
                key={i}
                className="absolute font-display text-[8px] sm:text-[10px] font-bold text-clock-numeral"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {roman[i]}
              </span>
            );
          })}

          {/* Tick marks */}
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-0 origin-bottom"
              style={{
                height: "50%",
                width: i % 5 === 0 ? "2px" : "1px",
                transform: `translateX(-50%) rotate(${i * 6}deg)`,
              }}
            >
              <div
                className={`${i % 5 === 0 ? "h-2 bg-clock-numeral/60" : "h-1 bg-clock-numeral/20"} w-full`}
              />
            </div>
          ))}

          {/* Hour hand */}
          <div
            className="absolute left-1/2 bottom-1/2 w-1 bg-clock-hand rounded-full origin-bottom"
            style={{
              height: "28%",
              transform: `translateX(-50%) rotate(${hourDeg}deg)`,
            }}
          />

          {/* Minute hand */}
          <div
            className="absolute left-1/2 bottom-1/2 w-[3px] bg-clock-hand rounded-full origin-bottom"
            style={{
              height: "36%",
              transform: `translateX(-50%) rotate(${minuteDeg}deg)`,
            }}
          />

          {/* Second hand */}
          <div
            className="absolute left-1/2 bottom-1/2 w-[1px] bg-clock-accent rounded-full origin-bottom transition-transform"
            style={{
              height: "38%",
              transform: `translateX(-50%) rotate(${secondDeg}deg)`,
            }}
          />

          {/* Center pin */}
          <div className="absolute left-1/2 top-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-clock-hand border border-clock-trim/50" />
        </div>

        {/* Title below face */}
        <p className="text-center font-display text-[10px] sm:text-xs text-clock-trim/70 mt-2 tracking-widest uppercase">
          Poetry Shelf
        </p>
      </div>

      {/* Waist / trunk with pendulum window */}
      <div className="relative w-44 sm:w-52 bg-clock-wood-dark border-x-2 border-clock-trim/20 py-4">
        {/* Pendulum window */}
        <div className="w-28 sm:w-32 h-20 sm:h-24 mx-auto rounded-t-[50%] bg-clock-wood/40 border-2 border-clock-trim/20 overflow-hidden flex items-start justify-center pt-1">
          {/* Pendulum rod + bob */}
          <div
            className="flex flex-col items-center origin-top animate-pendulum"
          >
            <div className="w-[2px] h-12 sm:h-14 bg-clock-trim/60" />
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-clock-trim border border-clock-trim/80 shadow-md" />
          </div>
        </div>
      </div>

      {/* Base */}
      <div className="w-52 sm:w-60 h-4 bg-clock-wood-dark rounded-b-sm border-x-2 border-b-2 border-clock-trim/20" />
      <div className="w-56 sm:w-64 h-2 bg-clock-wood-dark/80 rounded-b-md" />
    </div>
  );
};
