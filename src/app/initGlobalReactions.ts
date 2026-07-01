import { reaction } from 'mobx';
import { analyticsStore } from '_entities/analytics/model';
import { orderStore } from '_entities/order/model';
import { AnalyticsEvent } from '_shared/api/analytics/types';

const CHECKOUT_REACTION_DELAY_MS = 300;

let skipInitialCheckoutEvent = true;

function initCheckoutAnalyticsReaction() {
    reaction(
        () => orderStore.checkoutSnapshot,
        snapshot => {
            if (skipInitialCheckoutEvent) {
                skipInitialCheckoutEvent = false;
                return;
            }

            analyticsStore.reportEvent(AnalyticsEvent.CHECKOUT_STATE_CHANGED, snapshot);
        },
        {
            delay: CHECKOUT_REACTION_DELAY_MS,
        },
    );
}

/** @scope .. */
export function initGlobalReactions() {
    initCheckoutAnalyticsReaction();
}
