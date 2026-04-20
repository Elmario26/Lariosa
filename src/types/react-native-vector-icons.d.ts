declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    allowFontScaling?: boolean;
    [key: string]: any;
  }

  const Icon: ComponentType<IconProps>;
  export default Icon;
}

