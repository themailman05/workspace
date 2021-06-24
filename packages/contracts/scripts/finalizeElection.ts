import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ElectionMetadata, GrantElectionAdapter, ShareType } from "../../utils/src/Contracts";
import { GrantElections, GrantElections__factory } from "../typechain";
import { merklize } from "./merkle";

type awardee = [string, BigNumber];

function calculateVaultShare(
  awardees: awardee[],
  shareType: ShareType
): awardee[] {
  if (shareType === ShareType.DynamicWeight) {
    const totalVotes = BigNumber.from(0);
    awardees.forEach((awardee) => totalVotes.add(awardee[1]));
    awardees = awardees.map((awardee) => [
      awardee[0],
      awardee[1].div(totalVotes).mul(100e18),
    ]);
  } else {
    const equalShare = BigNumber.from(100e18).div(awardees.length);
    awardees = awardees.map((awardee) => [awardee[0], equalShare]);
  }

  return awardees;
}

function shuffleAwardees(
  awardees: awardee[],
  randomNumber: number,
  ranking: number
): awardee[] {
  awardees = awardees.slice(0, ranking);
  for (let i = 0; i < awardees.length; i++) {
    let n = i + (randomNumber % (awardees.length - i));
    awardees[n], (awardees[i] = awardees[i]), awardees[n];
  }
  return awardees;
}

function countVotes(electionMetaData: ElectionMetadata): awardee[] {
  const awardees: awardee[] = [];
  electionMetaData.votes.forEach((vote) => {
    const awardee = awardees.find((awardee) => awardee[0] == vote.beneficiary);
    if (awardee == undefined) {
      awardees.push([vote.beneficiary, vote.weight]);
    } else {
      awardee[1].add(vote.weight);
    }
  });
  return awardees;
}

function rankAwardees(
  electionMetaData: ElectionMetadata
): awardee[] {
  let awardees = countVotes(electionMetaData);
  awardees.sort((a, b) => Number(a[1].toString()) - Number(b[1].toString()));
  if (electionMetaData.useChainlinkVRF) {
    awardees = shuffleAwardees(
      awardees,
      electionMetaData.randomNumber,
      electionMetaData.configuration.ranking
    );
  }
  const cutOff = electionMetaData.configuration.awardees;
  return awardees.slice(0, cutOff);
}

export default async function finalizeElection(
  args,
  hre: HardhatRuntimeEnvironment
): Promise<void> {
  console.log("finalize current grant election of term: " + args.term);

  const [signer] = await hre.ethers.getSigners();
  const grantElection = new ethers.Contract(
    process.env.ADDR_GRANT_ELECTION,
    GrantElections__factory.abi
  ) as GrantElections;

  console.log("getting election meta data...");
  const electionMetaData: ElectionMetadata = await GrantElectionAdapter(
    grantElection
  ).getElectionMetadata(args.term);

  console.log("ranking awardees...");
  let winner = rankAwardees(electionMetaData);
  console.log("and the winner are: " + winner);

  console.log("calculating vault share...")
  winner = calculateVaultShare(winner, electionMetaData.shareType)

  console.log("creating merkle root...");
  const merkleTree = merklize(winner);
  const merkleRoot = "0x" + merkleTree.getRoot().toString("hex");
  console.log("and the merkle root is: " + merkleRoot);

  console.log("finalizing grant election...");
  await grantElection
    .connect(signer)
    .proposeFinalization(args.term, merkleRoot);
  console.log("grant election finalized");
}
