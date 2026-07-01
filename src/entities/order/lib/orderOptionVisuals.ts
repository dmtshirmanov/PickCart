/** @scopeDefault * */
import { ClipboardCheck, Clock, DoorOpen, Phone } from 'lucide-react-native';
import { useMemo } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { lightTheme } from '_shared/config/themes';
import { ORDER_OPTION_LABELS, orderStore, type OrderOption, type OrderOptionKey } from '../model';

type ThemeColor = typeof lightTheme.color;

type OrderOptionTone = 'info' | 'primary' | 'error';

export type OrderOptionVisualConfig = {
  Icon: typeof DoorOpen;
  iconColor: string;
  backgroundColor: string;
};

export const ORDER_OPTION_ICONS = {
  leaveAtTheDoor: DoorOpen,
  callForDelivery: Phone,
  deliveryAtConvenientTime: Clock,
  checkCompleteness: ClipboardCheck,
} as const satisfies Record<OrderOptionKey, typeof DoorOpen>;

const ORDER_OPTION_TONES = {
  leaveAtTheDoor: 'info',
  callForDelivery: 'primary',
  deliveryAtConvenientTime: 'primary',
  checkCompleteness: 'error',
} as const satisfies Record<OrderOptionKey, OrderOptionTone>;

const TONE_COLORS: Record<
  OrderOptionTone,
  (color: ThemeColor) => Pick<OrderOptionVisualConfig, 'iconColor' | 'backgroundColor'>
> = {
  info: color => ({
    iconColor: color.info,
    backgroundColor: color.infoLight,
  }),
  primary: color => ({
    iconColor: color.primary,
    backgroundColor: color.primaryLight,
  }),
  error: color => ({
    iconColor: color.error,
    backgroundColor: color.errorLight,
  }),
};

function createOrderOptionVisualsMap(
  color: ThemeColor,
): Record<OrderOptionKey, OrderOptionVisualConfig> {
  return (Object.keys(ORDER_OPTION_LABELS) as OrderOptionKey[]).reduce(
    (config, key) => {
      config[key] = {
        Icon: ORDER_OPTION_ICONS[key],
        ...TONE_COLORS[ORDER_OPTION_TONES[key]](color),
      };

      return config;
    },
    {} as Record<OrderOptionKey, OrderOptionVisualConfig>,
  );
}

export type OrderOptionWithVisual = OrderOption & OrderOptionVisualConfig;

export function useOrderOptionsWithVisuals(): OrderOptionWithVisual[] {
  const { theme } = useUnistyles();
  const visualsMap = useMemo(() => createOrderOptionVisualsMap(theme.color), [theme.color]);

  return orderStore.optionsList.map(option => ({
    ...option,
    ...visualsMap[option.key],
  }));
}
