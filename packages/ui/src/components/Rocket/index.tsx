import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ReactComponent as RocketSvg } from './rocket.svg';

const rocketAnimation = keyframes`
from, to { transform: translate3d(-1px, 0, 0) rotate3d(0,0,1,-0.4deg); }
25% { transform: translate3d(1px, 0, 0) rotate3d(0,0,1,0.4deg); }
50% { transform: translate3d(-1px, 0, 0) rotate3d(0,0,1,-0.4deg); }
75% { transform: translate3d(1px, 0, 0) rotate3d(0,0,1,0.4deg); }
`;

const planetAnimation = keyframes`
from,
to {
  transform: translate3d(0, 0, 0);
}
50% {
  transform: translate3d(4px, 0, 0);
}
75% {
  transform: translate3d(2px, 2px, 0) scale3d(1.05,1.05,1);
}
`;

const jupiterAnimation = keyframes`
from,
to {
  transform: translate3d(5px, 0, 0);
}
25% {
  transform: translate3d(0, 0, 0) scale3d(1.05,1.05,1);
}
50% {
  transform: translate3d(-5px, 0, 0);
}
`;

const starAnimation = keyframes`
from,
to {
  transform: scale3d(1, 1, 1);
}

50% {
  transform: scale3d(1.2, 1.2, 1) rotate3d(0,0,1,-5deg);
}`;

const StyledRocket = styled(RocketSvg)`
  position: relative;
  width: 100%;
  height: 93.39752407%;

  * {
    transform-box: fill-box;
    transform-origin: center center;
  }

  #ship {
    transform-origin: 75% 20%;
    animation: ${rocketAnimation};
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
  }
  #star1,
  #star2,
  #star3,
  #star4 {
    animation: ${starAnimation};
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in;
  }
  #star2 {
    animation-delay: -0.2s;
  }
  #star3 {
    animation-delay: -0.4s;
  }
  #star4 {
    animation-delay: -0.6s;
  }
  #planet1,
  #planet2,
  #planet3,
  #planet4,
  #planet5,
  #planet6 {
    animation: ${planetAnimation};
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in;
  }
  #planet2 {
    animation-delay: -0.2s;
  }
  #planet3 {
    animation-delay: -0.3s;
  }
  #planet4 {
    animation-delay: -0.4s;
  }
  #planet5 {
    animation-delay: -0.5s;
  }
  #planet6 {
    animation-delay: -0.6s;
  }

  #jupiter1,
  #jupiter2,
  #jupiter3 {
    animation: ${jupiterAnimation};
    animation-duration: 5s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in;
  }
  #jupiter2 {
    animation-delay: -1s;
  }
  #jupiter3 {
    animation-delay: -2s;
  }
`;

export const Rocket: React.FC = () => <StyledRocket />;

export default Rocket;
