import { View, Text, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import React, { FC } from 'react';

interface CustomTextInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const CustomTextInput: FC<CustomTextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  textStyle,
  containerStyle,
  ...rest
}) => {
  return (
    <View style={containerStyle}>
      <Text>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[
          textStyle,
          {
            width: '90%',
            borderBottomWidth: 1,
          },
        ]}
        {...rest}
      />
    </View>
  );
};

export default CustomTextInput;
