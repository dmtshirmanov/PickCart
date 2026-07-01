/** @scopeDefault * */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import { Alert } from 'react-native';
import { checkoutService } from '_shared/api/checkout/service';
import type { CheckoutReservation } from '_shared/api/checkout/types';

class ReservationStore {
  reservation?: CheckoutReservation = undefined;

  private readonly hydrationPromise: Promise<void>;

  constructor() {
    makeAutoObservable(this);
    this.hydrationPromise = makePersistable(this, {
      name: 'ReservationStore',
      properties: ['reservation'],
      storage: AsyncStorage,
    })
      .then(() => {
        runInAction(() => {
          this.restorePersistedReservation();
        });
      })
      .catch(error => {
        console.error('[ReservationStore] persistence failed', error);
      });
  }

  async waitForHydration() {
    await this.hydrationPromise;
  }

  restorePersistedReservation() {
    if (this.reservation && this.isReservationExpired) {
      this.reservation = undefined;
    }
  }

  get hasReservation() {
    return this.reservation !== undefined && !this.isReservationExpired;
  }

  get isReservationExpired() {
    if (!this.reservation) {
      return false;
    }

    return Date.now() >= this.reservation.expiresAt;
  }

  setReservation(reservation: CheckoutReservation) {
    this.reservation = reservation;
  }

  clearReservation() {
    this.reservation = undefined;
  }

  async releaseReservation() {
    if (!this.reservation) {
      return;
    }

    const reservationId = this.reservation.id;
    await checkoutService.releaseReservation(reservationId);

    runInAction(() => {
      this.reservation = undefined;
    });
  }

  async ensureCartEditable(): Promise<boolean> {
    if (!this.hasReservation) {
      return true;
    }

    return new Promise(resolve => {
      Alert.alert('Отменить бронь?', 'Изменение корзины отменит бронирование товаров.', [
        { text: 'Нет', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Да',
          onPress: () => {
            this.releaseReservation().then(() => resolve(true));
          },
        },
      ]);
    });
  }

  async runCartMutation(action: () => void) {
    const canEdit = await this.ensureCartEditable();

    if (!canEdit) {
      return;
    }

    action();
  }

  async handleReservationExpired() {
    if (!this.reservation) {
      return;
    }

    await this.releaseReservation();

    Alert.alert('Бронь истекла', 'Забронируйте товары заново из корзины.');
  }
}

export const reservationStore = new ReservationStore();
