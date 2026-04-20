import { View, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import React, { FC } from 'react';

interface CustomButtonProps {
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  label: string;
  onPress: () => void;
}

const CustomButton: FC<CustomButtonProps> = ({
  containerStyle,
  textStyle,
  label,
  onPress,
}) => {
  return (
    <View style={containerStyle}>
      <TouchableOpacity onPress={onPress}>
        <View
          style={{
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={textStyle}>{label}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
