const timeThresholds = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  y: 31536000,
};

module.exports.formatTimeAgo = function (timeStamp) {
  if (!(timeStamp instanceof Date)) return "";
  const seconds = Math.floor((Date.now() - timeStamp) / 1000); // Convert to seconds to avoid bigInt

  let currentUnit = "s"; // Set default unit as s

  for (const [unit, divisor] of Object.entries(timeThresholds)) {
    if (seconds < divisor) {
      break;
    } else {
      currentUnit = unit;
    }
  }

  const calcTime = Math.floor(seconds / timeThresholds[currentUnit]);
  return `${calcTime}${currentUnit} ago`;
};
