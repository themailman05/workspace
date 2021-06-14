import { LinearProgress } from '@material-ui/core';

export default function GlobalLinearProgress({ visible }):JSX.Element{
  return visible && <LinearProgress />;
};
