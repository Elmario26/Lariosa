import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import CustomTextInput from '../../components/CustomTextInput'
import CustomButton from '../../components/CustomButton'

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name')
      return false
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email')
      return false
    }
    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address')
      return false
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter a password')
      return false
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters')
      return false
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match')
      return false
    }
    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // TODO: Replace with your actual API call
      // const response = await registerUser({ fullName, email, password })
      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ])
    } catch (error) {
      Alert.alert('Error', error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </Text>
          <Text className="text-base text-gray-600">
            Sign up to get started
          </Text>
        </View>

        {/* Form Section */}
        <View className="mb-6">
          {/* Full Name Input */}
          <CustomTextInput
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            containerStyle={{ marginBottom: 20 }}
            textStyle={{
              fontSize: 14,
              color: '#333',
              paddingVertical: 8,
              paddingHorizontal: 8,
            }}
          />

          {/* Email Input */}
          <CustomTextInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            containerStyle={{ marginBottom: 20 }}
            textStyle={{
              fontSize: 14,
              color: '#333',
              paddingVertical: 8,
              paddingHorizontal: 8,
            }}
          />

          {/* Password Input */}
          <CustomTextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            containerStyle={{ marginBottom: 20 }}
            textStyle={{
              fontSize: 14,
              color: '#333',
              paddingVertical: 8,
              paddingHorizontal: 8,
            }}
          />

          {/* Confirm Password Input */}
          <CustomTextInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            containerStyle={{ marginBottom: 8 }}
            textStyle={{
              fontSize: 14,
              color: '#333',
              paddingVertical: 8,
              paddingHorizontal: 8,
            }}
          />

          {/* Password hint */}
          <Text className="text-xs text-gray-500 mb-6 px-1">
            Password must be at least 6 characters
          </Text>
        </View>

        {/* Register Button */}
        <CustomButton
          label={isLoading ? 'Creating Account...' : 'Sign Up'}
          onPress={handleRegister}
          containerStyle={{
            marginBottom: 16,
            borderRadius: 8,
            overflow: 'hidden',
          }}
          textStyle={{
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
            backgroundColor: isLoading ? '#9CA3AF' : '#3B82F6',
            paddingVertical: 14,
            textAlign: 'center',
            width: '100%',
          }}
        />

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-3 text-gray-500 text-sm">OR</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 text-sm">
            Already have an account?{' '}
          </Text>
          <CustomButton
            label="Login"
            onPress={() => navigation.replace('Login')}
            textStyle={{
              color: '#3B82F6',
              fontSize: 14,
              fontWeight: '600',
            }}
            containerStyle={{
              padding: 0,
            }}
          />
        </View>
        
      </View>
    </ScrollView>
  )
}

export default Register