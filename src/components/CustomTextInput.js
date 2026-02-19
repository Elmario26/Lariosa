import { View, Text } from 'react-native'
import {TextInput} from 'react-native-gesture-handler'
import React from 'react'

const CustomTextInput = ({label, placeholder, value, onChangeText, textStyle, containerStyle}) => {
  return (
    <View style = {containerStyle}>
        <Text>{label}</Text>
     <TextInput 
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style= {[
        textStyle,
        {
        width:'90%',
        borderBottomWidth:1,
        },
      ]} 
    />
    </View>
  )
}

export default CustomTextInput;