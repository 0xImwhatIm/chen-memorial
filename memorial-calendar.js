(() => {
  const dayMs = 86_400_000;
  const taipeiOffset = 8 * 3_600_000;
  // Fixed memorial epoch. Changes to the site and its modes must preserve it.
  const memorialDay = Date.UTC(2026, 10, 15) / dayMs;

  function today(now = Date.now()) {
    const dayNumber = Math.floor((now + taipeiOffset) / dayMs);
    const date = new Date(dayNumber * dayMs);
    const day = date.getUTCDate();
    return {
      dayNumber,
      day,
      daysFree: Math.max(0, dayNumber - memorialDay),
      birthdaySeason: date.getUTCMonth() === 11 && day >= 11 && day <= 16,
      nextMidnight: (dayNumber + 1) * dayMs - taipeiOffset,
    };
  }

  function watch(callback) {
    let timer;
    function refresh() {
      clearTimeout(timer);
      const current = today();
      callback(current);
      timer = setTimeout(refresh, Math.max(1, current.nextMidnight - Date.now()));
    }
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refresh();
    });
    refresh();
  }

  window.memorialCalendar = Object.freeze({ today, watch, dayMs });
})();
