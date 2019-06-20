import moment from 'moment';

export default (user, updater) => {
  if (!user || !user.last_active_at) {
    return 'Not active';
  }

  const diff = moment().diff(moment(user.last_active_at));
  const diffInMinutes = moment.duration(diff).asMinutes();

  const checkInMinute = () => {
    if (updater) {
      setTimeout(() => updater(), 60000);
    }
  };

  if (diffInMinutes < 1) {
    checkInMinute();
    return 'Active now';
  }

  if (diffInMinutes < 30) {
    checkInMinute();
    return `Active ${Math.floor(diffInMinutes)}m ago`;
  }

  if (moment(user.last_active_at).isSame(moment(), 'day')) {
    return `Active at ${moment(user.last_active_at).format('HH:mm')}`;
  }

  return `Active at ${moment(user.last_active_at).format('DD MMMM, HH:mm')}`;
};
