const { parseEther, solidityKeccak256 } = require("ethers/lib/utils");
const MerkleTree = require("merkle-tree-solidity").default;

const merklize = function (elements) {
  let merkleElements = [];
  Object.entries(elements).forEach(([who, amount]) =>
    merkleElements.push(makeElement(who, amount))
  );
  return new MerkleTree(merkleElements);
};

const makeElement = function (who, amount) {
  return Buffer.from(
    solidityKeccak256(['address', 'uint256'], [who, amount]).replace(/^0x/, ""),
    "hex"
  );
};

const generateClaims = function (accounts) {
  let claims = {};
  let split = parseEther("100").div(accounts.length).toString();
  accounts.forEach((address, i) => (claims[address] = String(split)));
  return claims;
};

module.exports = {
  merklize,
  makeElement,
  generateClaims,
};
