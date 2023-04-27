import { intervalToDuration } from 'date-fns';
import { useEffect, useState } from 'react';

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export default function useCountdown(date: Date): TimeLeft {
  const calculateTimeLeft = (): TimeLeft => {
    const currDate = new Date();
    const diff = intervalToDuration({
      start: currDate,
      end: date,
    });
    const timeLeft: TimeLeft = {
      days: diff.days,
      hours: diff.hours,
      minutes: diff?.minutes,
      seconds: diff?.seconds,
    };
    return timeLeft;
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(calculateTimeLeft);
    }, 1000);
  });

  return timeLeft;
}
