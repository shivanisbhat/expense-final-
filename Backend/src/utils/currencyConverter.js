const axios = require('axios');

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );

    const rate = response.data.rates[toCurrency];
    
    if (!rate) {
      console.warn(`Exchange rate not found for ${toCurrency}, using amount as-is`);
      return amount;
    }

    return amount * rate;
  } catch (error) {
    console.error('Currency conversion error:', error.message);
    return amount;
  }
};

module.exports = { convertCurrency };