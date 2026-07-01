import { useEffect, useMemo, useRef, useState } from 'react';
import { orderStore } from '_entities/order/model';
import { formatReservationCountdown } from './checkoutFormatting';

interface Options {
  enabled?: boolean;
  onExpired?: () => void;
}

/** @scope * */
export function useReservationCountdown({ enabled = true, onExpired }: Options = {}) {
  const [now, setNow] = useState(Date.now());
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  const { hasReservation, reservation } = orderStore;

  const countdown = useMemo(() => {
    if (!reservation) {
      return '00:00';
    }

    return formatReservationCountdown(reservation.expiresAt, now);
  }, [now, reservation]);

  useEffect(() => {
    if (!enabled || !hasReservation || !reservation) {
      return;
    }

    const expiresAt = reservation.expiresAt;

    const timerId = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);

      if (currentNow >= expiresAt) {
        clearInterval(timerId);
        orderStore.handleReservationExpired().then(() => {
          onExpiredRef.current?.();
        });
      }
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [enabled, hasReservation, reservation]);

  return countdown;
}
