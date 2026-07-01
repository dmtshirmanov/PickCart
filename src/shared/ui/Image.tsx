import FastImage, { type ResizeMode } from '@d11/react-native-fast-image';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import fallbackImage from '../assets/product-fallback.png';

interface Props {
  uri: string;
  resizeMode?: ResizeMode;
}

/** @scope * */
export function Image({ uri, resizeMode = FastImage.resizeMode.contain }: Props) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError || !uri) {
    return (
      <FastImage
        source={fallbackImage}
        style={styles.image}
        resizeMode={FastImage.resizeMode.contain}
      />
    );
  }

  return (
    <FastImage
      source={{
        uri,
        priority: FastImage.priority.normal,
      }}
      style={styles.image}
      resizeMode={resizeMode}
      onError={handleError}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
