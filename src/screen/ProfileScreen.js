import { Image, Text, View } from 'react-native';
const ProfileScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'blue',
      }}
    >
      <Image
        source={require('../../assets/LOGO2.png')}
        style={{ width: 200, height: 200, resizeMode: 'contain' }}
      />
      <Text style={{ fontSize: 40 }}>ProfileScreen</Text>
    </View>
  );
};

export default ProfileScreen;