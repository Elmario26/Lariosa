import { useNavigation } from '@react-navigation/native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { ROUTES } from '../utils';
import { logoutRequest } from '../app/actions';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'red',
      }}
    >
      <Image
        source={require('../../assets/LOGO2.png')}
        style={{ width: 200, height: 200, resizeMode: 'contain' }}
      />
      <Text style={{ fontSize: 20 }}>HomeScreen</Text>

      {/* <Button title="GO TO PROFILE" /> */}

      <TouchableOpacity
        onPress={() => {
          navigation.navigate(ROUTES.PROFILE);
        }}
      >
        <View
          style={{
            backgroundColor: 'green',
            padding: 10,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 40, color: 'white' }}>GO TO PROFILE</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          dispatch(logoutRequest());
        }}
        style={{ marginTop: 20 }}
      >
        <View
          style={{
            backgroundColor: 'red',
            padding: 10,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 24, color: 'white' }}>LOGOUT</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;