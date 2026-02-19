import { View, Text } from 'react-native'
import React from 'react'

import CustomTextInput from '../../components/CustomTextInput'
const Login = () => {

  const [emailAdd, setEmailAdd] = React.useState('');
  const [password, setPassword ] = React.useState('');
  return (
    <View style ={{flex:1, padding:20,}}>

      <CustomTextInput 
      label={'Email address'}
      placeholder={'Enter email address'}
      containerStyle={{
        padding: 5,
      }}
      textStyle={{
        borderRadius: 10,
        color: 'black',
        marginLeft: 10,
      }}
      />
      
      <CustomTextInput 
      label={'Enter password'} 
      placeholder={'Enter password'}
      containerStyle={{
        padding: 5,
        marginTop: 10,
      }}
      textStyle={{
        borderRadius: 10,
        color: 'black',
        marginLeft: 10,
      }}/>
    </View>
  )
}

export default Login