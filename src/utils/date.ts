import dayjs, { type ConfigType } from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(advancedFormat);
dayjs.extend(timezone);

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

export const formatDate = (date: ConfigType) => {
  return dayjs(date).format('DD MMMM YYYY HH:mm');
};

export const getNowDate = () => dayjs().toISOString();

export default dayjs;
