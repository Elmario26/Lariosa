import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'

import CustomTextInput from '../../components/CustomTextInput'
import CustomButton from '../../components/CustomButton'
import { ROUTES } from '../../utils'

const Login = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { isLoading, error, isAuthenticated } = useSelector(state => state.auth)

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  // Navigate to home when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main')
    }
  }, [isAuthenticated])

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error)
    }
  }, [error])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email')
      return
    }
    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address')
      return
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password')
      return
    }

    // Dispatch Redux action
    dispatch({
      type: 'LOGIN',
      payload: {
        email,
        password,
      },
    })
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>

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
          value={email}
          onChangeText={setEmail}
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
          }}
        />

        <CustomButton
          label={isLoading ? 'Logging in...' : 'Login'}
          containerStyle={{
            backgroundColor: isLoading ? '#9CA3AF' : '#2196F3',
            borderRadius: 10,
            marginTop: 30,
            width: '90%',
            alignSelf: 'center',
          }}
          textStyle={{
            color: 'white',
            fontWeight: 'bold',
          }}
          onPress={handleLogin}
          disabled={isLoading}
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
            Don't have an account?
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
    </ScrollView>
  )
}

export default Login