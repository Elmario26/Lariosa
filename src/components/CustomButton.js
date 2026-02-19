import { View, TouchableOpacity, Text } from 'react-native'
import React from 'react'


const CustomButton = ({ containerStyle, textStyle, label, onPress }) => {
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

export default CustomButton