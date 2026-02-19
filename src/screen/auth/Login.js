import { View, Text, TouchableOpacity, Alert, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

import CustomTextInput from '../../components/CustomTextInput'
import CustomButton from '../../components/CustomButton'
import { ROUTES } from '../../utils'

const Login = () => {
  const navigation = useNavigation()
  const [emailAdd, setEmailAdd] = React.useState('');
  const [password, setPassword ] = React.useState('');


  return (
    <View style ={{flex:1, padding:20, justifyContent: 'center'}}>

      <Image
        source={require('../../../assets/LOGO2.png')}
        style={{
          width: 250,
          height: 250,
          alignSelf: 'center',
          marginBottom: 30,
          resizeMode: 'contain',
        }}
      />

      <CustomTextInput 
      label={'Email address'}
      placeholder={'Enter email address'}
      value={emailAdd}
      onChangeText={setEmailAdd}
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
      value={password}
      onChangeText={setPassword}
      containerStyle={{
        padding: 5,
        marginTop: 10,
      }}
      textStyle={{
        borderRadius: 10,
        color: 'black',
        marginLeft: 10,
      }}/>

    
        
      
      <CustomButton 
        label = {"Login"}
        containerStyle={{
                backgroundColor: '#2196F3',
                borderRadius: 10,
                marginTop: 30,
                width: '90%',
                
        }}
        textStyle={{
          color: 'white',
          fontWeight: 'bold',
        }}
        onPress= {() => {
          if (emailAdd === '' || password === '') {
          Alert.alert(
            'Invalid credentials',
            'Please check your email and password and try again.',
          );
          return;
          }
        }}
      
      />

      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
      }}>
        <Text style={{
          color: 'black',
          fontSize: 14,
        }}>
          Create an account?
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
          <Text style={{
            color: '#2196F3',
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 5,
          }}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Login