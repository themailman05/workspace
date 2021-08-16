export const getDummyEmissionData = () => {
  return new Array(20).fill(undefined).map((x, i) => {
    return {
      date: `${i}/05/2021`,
      'CO2 Emissions': Math.floor(500 * Math.random()),
      'Transaction Volume': Math.floor(500 * Math.random()),
    };
  });
};
