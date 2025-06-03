// 3hours 30mins
export const hourMinStringToMilliseconds = (timeInString: string) => {
  const regex = /(?:(\d+)\s*(h|hrs|hours))?\s*(?:(\d+)\s*(m|mins|minutes))?/;

  const match = timeInString.match(regex);
  if (match) {
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[3] ? parseInt(match[3]) : 0;
    return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
  } else {
    throw new Error(
      "Invalid time string format. Example: 3h 30m / 3 hours 3 minutes / 3hrs 3mins"
    );
  }
};

export const millisecondsToHourMinSecondString = (ms: number) => {
  let timeString = "";

  if (ms > 1000 * 60 * 60) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    timeString += `${hours}h `;
    ms %= 1000 * 60 * 60;
  }

  if (ms > 1000 * 60) {
    const minutes = Math.floor(ms / (60 * 1000));
    timeString += `${minutes}m `;
    ms %= 1000 * 60;
  }

  if (ms > 1000) {
    const seconds = Math.floor(ms / 1000);
    timeString += `${seconds}s`;
  }

  return timeString;
};

/**
 * Get all dates in a range, including the start and end dates
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns An array of dates in the range
 */
export const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  // Set time to beginning of day to avoid time comparison issues
  currentDate.setHours(0, 0, 0, 0);
  const lastDate = new Date(endDate);
  lastDate.setHours(0, 0, 0, 0);

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
