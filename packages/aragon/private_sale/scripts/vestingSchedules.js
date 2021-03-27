const date = require('date.js');
const getDate = (string) => {
  return Math.round(date(string).getTime() / 1000);
}

module.exports = {
  test: {
    start: getDate('now'),
    cliff: getDate('10 minutes from now'),
    vesting: getDate('30 minutes from now')
  },
  team: {
    start: getDate('now'),
    cliff: getDate('1 year from now'),
    vesting: getDate('4 years from now'),
  },
  earlyBackers_1: {
    start: getDate('now'),
    cliff: getDate('1 year from now'),
    vesting: getDate('15 months from now'),
  },
  earlyBackers_2: {
    start: getDate('now'),
    cliff: getDate('1 year from now'),
    vesting: getDate('18 months from now'),
  },
  foundation: {
    start: getDate('now'),
    cliff: getDate('1 year from now'),
    vesting: getDate('1 year from now'),
  },
}