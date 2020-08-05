export default function convertHourToMinutes(time: string) {
  // H:m
  const [hour, minutes] = time.split(":").map(Number);
  const timeInMinutes = hour * 60 + minutes;
  return timeInMinutes;
}
