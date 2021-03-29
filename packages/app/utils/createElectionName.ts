export default function createElectionName(election): string {
  const grantTerm = ['Monthly', 'Quarterly', 'Yearly'];
  const startDate = new Date(Number(election.startTime) * 1000);
  return `${grantTerm[election.grantTerm]} - ${
    startDate.getMonth() + 1
  }/${startDate.getFullYear()}`;
}
