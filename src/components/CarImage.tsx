import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageProps, StyleProp, ImageStyle } from 'react-native';
import { getCarImageCandidateUrls } from '../app/config/api';

const FALLBACK_URI =
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800';

export interface CarImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  /** Ordered URLs to try (/api/car-images, then legacy paths) */
  uris?: string[];
  style?: StyleProp<ImageStyle>;
}

function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter((url) => {
    const key = url.trim();
    if (!key || seen.has(key) || key === FALLBACK_URI) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Loads a car photo: tries each backend URL, then a placeholder.
 */
const CarImage: FC<CarImageProps> = ({ uri, uris, style, resizeMode = 'cover', ...rest }) => {
  const candidates = useMemo(() => {
    if (uris?.length) return dedupeUrls(uris);
    if (uri) {
      const fromUri = dedupeUrls(getCarImageCandidateUrls(uri));
      if (fromUri.length > 0) return fromUri;
      return dedupeUrls([uri]);
    }
    return [];
  }, [uri, uris]);

  const [index, setIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(candidates.length === 0);
  const exhausted = useRef(false);

  useEffect(() => {
    setIndex(0);
    setUseFallback(candidates.length === 0);
    exhausted.current = false;
  }, [candidates]);

  const currentUri = useFallback ? FALLBACK_URI : (candidates[index] ?? FALLBACK_URI);

  const handleError = (): void => {
    if (exhausted.current) return;

    const nextIndex = index + 1;
    if (nextIndex < candidates.length) {
      setIndex(nextIndex);
      return;
    }

    exhausted.current = true;
    setUseFallback(true);
  };

  return (
    <Image
      key={useFallback ? 'fallback' : currentUri}
      source={{ uri: currentUri }}
      style={style}
      resizeMode={resizeMode}
      onError={handleError}
      {...rest}
    />
  );
};

export default CarImage;
