export function calNightPayDetail(startTime, endTime, nightRate, nightAllowance) {
  const NIGHT_START = 22; // 22:00
  const NIGHT_END = 6;    // 06:00

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    // 자정을 지나 다음날까지 일한 경우
    end.setDate(end.getDate() + 1);
  }

  let nightMinutes = 0;
  const current = new Date(start);

  // 1분씩 증가하며 야간인지 확인
  while (current < end) {
    const hour = current.getHours();
    if (hour >= NIGHT_START || hour < NIGHT_END) {
      nightMinutes += 1;
    }
    current.setMinutes(current.getMinutes() + 1);
  }

  const nightHours = Math.round((nightMinutes / 60) * 100) / 100; // 소수점 2자리
  const nightPay = nightHours * nightAllowance * nightRate;

  return { nightHours, nightPay };
}