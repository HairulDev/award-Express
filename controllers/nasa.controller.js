
const axios = require('axios');

async function nasaDashboard() {
  try {
    const response = await axios.get(`https://jsonmock.hackerrank.com/api/inventory?barcode=${barcode}`);
    const data = response.data;

    if (data.data.length === 0) {
      return '-1';
    } else {
      const item = data.data[0];
      const discountedPrice = Math.round(item.price - ((item.discount / 100) * item.price));
      return discountedPrice.toString();
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  nasaDashboard,
};