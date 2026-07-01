import FastImage, { type ResizeMode } from '@d11/react-native-fast-image';
import { useCallback, useEffect, useState } from 'react';
import type { ImageRequireSource } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { match, P } from 'ts-pattern';

interface Props {
  uri: string;
  fallback?: ImageRequireSource;
  resizeMode?: ResizeMode;
}

/** @scope * */
export function Image({ uri, fallback, resizeMode = FastImage.resizeMode.contain }: Props) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return match({ failed: hasError || !uri, fallback })
    .with({ failed: false }, () => (
      <FastImage
        source={{
          uri,
          priority: FastImage.priority.normal,
        }}
        style={styles.image}
        resizeMode={resizeMode}
        onError={handleError}
      />
    ))
    .with({ failed: true, fallback: P.not(P.nullish) }, ({ fallback: fallbackSource }) => (
      <FastImage source={fallbackSource} style={styles.image} resizeMode={resizeMode} />
    ))
    .otherwise(() => null);
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
