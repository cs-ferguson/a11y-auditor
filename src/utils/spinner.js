const ora = require("ora");

const makeSpinner = () => {
  return ora();
};

module.exports = makeSpinner;
