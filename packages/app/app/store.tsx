import React, { createContext, useReducer } from 'react';
import {
  AppActions,
  DISPLAY_NOTIFICATION,
  TOGGLE_NOTIFICATION,
} from './actions';

export interface Notification {
  visible: boolean;
  type: 'info' | 'warn';
  isFlash?: boolean;
  content: React.ReactElement;
  backdrop?: boolean;
}


interface DefaultState {
  notifications: Notification;
}

const initialState: DefaultState = {
  notifications: {
    visible: false,
    type: 'info',
    content: <></>,
    isFlash: false,
    backdrop: false,
  },
};

const store = createContext(
  (initialState as unknown) as {
    state: DefaultState;
    dispatch: React.Dispatch<any>;
  },
);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    (state: DefaultState, action: AppActions) => {
      switch (action.type) {
        case DISPLAY_NOTIFICATION:
          return {
            ...state,
            notifications: action.payload,
          };
        case TOGGLE_NOTIFICATION:
          return {
            ...state,
            notifications: {
              ...state.notifications,
              visible: !state.notifications.visible,
            },
          };
        default:
          return {
            ...state,
          };
      }
    },
    initialState,
  );

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
