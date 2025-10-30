export const convertAMPMTo24HourDate = (time) => {
  const [timePart, period] = time.split(' ');
  let [hours, minutes] = timePart.split(':');

  if (period === 'PM' && hours !== 12) {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
};

export const time24hrTo12hr = (time) => {
  let [hours, minutes] = time.split(':');
  let period = 'AM';

  if (hours > 12) {
    hours -= 12;
    period = 'PM';
  }

  if (hours === 12) {
    period = 'Noon';
  }

  if (hours === 0) {
    hours = 12;
    period = 'Midnight';
  }

  return `${hours}:${minutes} ${period}`;
};
