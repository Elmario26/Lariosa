// Redux Store Configuration
import { createStore, combineReducers, applyMiddleware, Store } from 'redux';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import authReducer, { AuthState } from './reducers/authReducer';
import vehiclesReducer, { VehiclesState } from './reducers/vehiclesReducer';
import bookingsReducer, { BookingsState } from './reducers/bookingsReducer';
import { authSaga } from './sagas/authSaga';
import { vehiclesSaga } from './sagas/vehiclesSaga';
import { bookingsSaga } from './sagas/bookingsSaga';

// Root state interface
export interface RootState {
  auth: AuthState;
  vehicles: VehiclesState;
  bookings: BookingsState;
}

// Saga middleware
const sagaMiddleware: SagaMiddleware<any> = createSagaMiddleware();

const persistConfig: PersistConfig<any> = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
  blacklist: [],
};

const authPersistConfig: PersistConfig<AuthState> = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'token', 'refreshToken', 'isAuthenticated'],
  blacklist: ['isLoading', 'error'], // Don't persist loading and error states
};

// Vehicles persist config
const vehiclesPersistConfig: PersistConfig<VehiclesState> = {
  key: 'vehicles',
  storage: AsyncStorage,
  whitelist: ['filters'],
};

// Root reducer
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  vehicles: persistReducer(vehiclesPersistConfig, vehiclesReducer),
  bookings: bookingsReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store: Store<RootState> = createStore(persistedReducer, applyMiddleware(sagaMiddleware));

// Create persistor
const persistor = persistStore(store);

// Run sagas
sagaMiddleware.run(authSaga);
sagaMiddleware.run(vehiclesSaga);
sagaMiddleware.run(bookingsSaga);

export { store, persistor };
