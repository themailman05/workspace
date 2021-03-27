const web3 = require('web3');
const toWei = (num) => web3.utils.toWei(num.toString());

const chunkArray = (myArray, chunk_size) => {
  var results = [];
  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }
  return results;
};

module.exports = {
  toWei,
  chunkArray,
}