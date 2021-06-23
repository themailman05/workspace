import { BigNumber, utils } from 'ethers';

export function formatAndRoundBigNumber(value: BigNumber): string {
  return Number(utils.formatEther(value.toString())).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

export function bigNumberToNumber(value: BigNumber): number {
  return Number(utils.formatEther(value.toString()));
}
