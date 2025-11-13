module.exports = ({ month, day, year }) => {
  if (!month || !day || !year) return;
  const padValue = (num) => String(num).padStart(2, "0");
  return `${padValue(month)}/${padValue(day)}/${year}`;
};
