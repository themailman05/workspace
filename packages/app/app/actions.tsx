import React from 'react';
import { Notification } from '../app/store';
import { Link } from '@material-ui/core';

export const DISPLAY_NOTIFICATION = 'notifications/DISPLAY_NOTIFICATION';
export const TOGGLE_NOTIFICATION = 'notifications/TOGGLE_NOTIFICATION';

export type AppActions =
  | DisplayNotificationAction
  | ToggleNotificationAction
;

export interface DisplayNotificationAction {
  type: typeof DISPLAY_NOTIFICATION;
  payload: Notification;
}
export const displayNotification = (
  notification: Partial<Notification>,
): DisplayNotificationAction => {
  return {
    type: DISPLAY_NOTIFICATION,
    payload: { ...notification, visible: true } as Notification,
  };
};

export interface ToggleNotificationAction {
  type: typeof TOGGLE_NOTIFICATION;
}
export const toggleNotification = (): ToggleNotificationAction => {
  return {
    type: TOGGLE_NOTIFICATION,
  };
};

export const showPaywall = (): DisplayNotificationAction => {
  return displayNotification({
    backdrop: true,
    isFlash: false,
    visible: true,
    type: 'info',
    content: (
      <div>
       Sorry, that feature is only available for <Link href="/modals/4">premium members</Link>.
      </div>
    ),
  });
};
