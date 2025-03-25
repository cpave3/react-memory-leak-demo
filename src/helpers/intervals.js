// List all active intervals
const activeIntervals = [];
const originalSetInterval = window.setInterval;
window.setInterval = function (callback, time) {
  const intervalId = originalSetInterval(callback, time);
  activeIntervals.push({
    id: intervalId,
    createdAt: new Date(),
    stackTrace: new Error().stack
  });
  return intervalId;
};

const originalClearInterval = window.clearInterval;
window.clearInterval = function (id) {
  const index = activeIntervals.findIndex(interval => interval.id === id);
  if (index !== -1) {
    activeIntervals.splice(index, 1);
  }
  originalClearInterval(id);
};

// Utility to list active intervals
function listActiveIntervals() {
  console.log('Active Intervals:', activeIntervals);
}
