import type { ActionEvent, ActivityEvent, OfferEvent } from '../typings';

export const useAction = () => {
  const on = (eventType: string, listener: EventListenerOrEventListenerObject) => {
    document.addEventListener(eventType, listener);
  };

  const off = (eventType: string, listener: EventListenerOrEventListenerObject) => {
    document.removeEventListener(eventType, listener);
  };

  const trigger = (eventType: string, data?: ActionEvent | ActivityEvent | OfferEvent) => {
    document.dispatchEvent(
      new CustomEvent<ActionEvent | ActivityEvent | OfferEvent>(eventType, {
        detail: data,
      })
    );
  };

  return {
    on,
    off,
    trigger,
  };
};
