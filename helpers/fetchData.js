module.exports = async (endpoint, { method = "GET" } = {}) => {
  const response = await fetch(endpoint, { method });
  const data = await response.json();
  return data;
};
