import { View, Text } from 'react-native'
import {TextInput} from 'react-native-gesture-handler'
import React from 'react'

const CustomTextInput = ({label, placeholder, value, textStyle, containerStyle}) => {
  return (
    <View style = {containerStyle}>
        <Text>{label}</Text>
     <TextInput 
      placeholder={placeholder}
      onChangeText={value}
      style= {[
        textStyle,
        {
        width:'80%',
        borderBottomWidth:1,
        },
      ]} 
    />
    </View>
  )
}

export default CustomTextInput;