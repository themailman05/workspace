import { BigNumber, utils } from 'ethers';

export function formatAndRoundBigNumber(value: BigNumber): string {
  return Number(utils.formatEther(value.toString())).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}
