import { LoaderCircle } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import {
  createAnimatedComponent,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';

const AnimatedLoaderCircle = createAnimatedComponent(LoaderCircle);

interface Props {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Loader({ size = 24, color, style }: Props) {
  const { theme } = useUnistyles();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={style}>
      <AnimatedLoaderCircle
        size={size}
        color={color ?? theme.color.textPrimary}
        style={animatedStyle}
      />
    </View>
  );
}
