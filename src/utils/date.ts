import dayjs, { type ConfigType } from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

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

export default dayjs;
