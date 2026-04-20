import React, { useState, useEffect, FC } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { RootState } from '../../app/store';
import { registerRequest } from '../../app/actions';

type RegisterScreenProps = StackScreenProps<any, 'Register'>;

const Register: FC<RegisterScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Show error alert when error occurs
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return false;
    }
    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter a password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = (): void => {
    if (!validateForm()) return;

    // Dispatch Redux action
    dispatch(
      registerRequest({
        fullName,
        email,
        password,
      })
    );

    // On success, navigate to Login (you can add listener in saga if needed)
    // For now, we'll show a success alert after registration
    Alert.alert('Success', 'Registration successful! Please log in.', [
      { text: 'OK', onPress: () => navigation?.replace?.('Login') },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
          <Text className="text-base text-gray-600">Sign up to get started</Text>
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
            }}
          />

          {/* Password Input */}
          <CustomTextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            containerStyle={{ marginBottom: 20 }}
            textStyle={{
              fontSize: 14,
              color: '#333',
            }}
          />

          {/* Confirm Password Input */}
          <CustomTextInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            containerStyle={{ marginBottom: 20 }}
            textStyle={{
              fontSize: 14,
              color: '#333',
            }}
          />
        </View>

        {/* Register Button */}
        <CustomButton
          label={isLoading ? 'Registering...' : 'Sign Up'}
          onPress={handleRegister}
          containerStyle={{
            backgroundColor: '#2563EB',
            borderRadius: 10,
            marginBottom: 16,
            padding: 5,
          }}
          textStyle={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
          }}
        />

        {/* Login Link */}
        <Text className="text-center text-gray-600">
          Already have an account?{' '}
          <Text
            className="text-blue-600 font-semibold"
            onPress={() => navigation?.goBack?.()}
          >
            Log In
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default Register;
