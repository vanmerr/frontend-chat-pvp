import { format } from 'date-fns';

const safeFormat = (timestamp, fmt = 'HH:mm') => {
  if (!timestamp || typeof timestamp !== 'object' || typeof timestamp._seconds !== 'number') return '';

  try {
    const millis = timestamp._seconds * 1000 + Math.floor(timestamp._nanoseconds / 1e6);
    const date = new Date(millis);
    if (isNaN(date.getTime())) return '';
    return format(date, fmt);
  } catch (err) {
    return '';
  }
};

export default safeFormat;
