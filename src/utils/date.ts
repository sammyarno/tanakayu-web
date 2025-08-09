import dayjs, { type ConfigType } from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(advancedFormat);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

dayjs.tz.setDefault('Asia/Jakarta');

export const formatDateRange = (start: ConfigType, end: ConfigType) => {
  if (!start || !end) return 'No Date';

  const startDate = dayjs(start);
  const endDate = dayjs(end);

  const isSameDay = startDate.isSame(endDate, 'day');

  if (isSameDay) {
    return `${startDate.format('DD MMMM YYYY')} ${startDate.format('HH:mm')} - ${endDate.format('HH:mm')}`;
  } else {
    return `${startDate.format('DD MMMM YYYY HH:mm')} - ${endDate.format('DD MMMM YYYY HH:mm')}`;
  }
};

export const getNowDate = () => dayjs().toISOString();

export const formatDate = (date: ConfigType) => dayjs(date).format('DD MMMM YYYY HH:mm');

export const getDateAhead = (days: number): string => {
  return dayjs().add(days, 'day').toISOString();
};

export const formatDateForTransaction = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return { day, dayName, monthYear };
};

// Parse various date formats and return ISO date string (YYYY-MM-DD)
export const parseExcelDate = (dateValue: any): string | null => {
  if (typeof dateValue === 'number') {
    // Excel date serial number
    const excelDate = dayjs('1900-01-01').add(dateValue - 2, 'day');
    return excelDate.format('YYYY-MM-DD');
  }

  if (typeof dateValue === 'string') {
    const dateStr = dateValue.trim();

    // Handle DD/MM/YYYY format (e.g., "16/07/2025")
    if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const parsedDate = dayjs(dateStr, 'DD/MM/YYYY');
      if (parsedDate.isValid()) {
        return parsedDate.format('YYYY-MM-DD');
      }
    }

    // Try other common formats
    const parsedDate = dayjs(dateStr);
    if (parsedDate.isValid()) {
      return parsedDate.format('YYYY-MM-DD');
    }
  }

  return null;
};

export default dayjs;
