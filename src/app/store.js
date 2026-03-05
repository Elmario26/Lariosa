// Redux Store Configuration
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import createSagaMiddleware from 'redux-saga'
import authReducer from './reducers/authReducer'
import { authSaga } from './sagas/authSaga'

// Saga middleware
const sagaMiddleware = createSagaMiddleware()

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth reducer
}

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
})

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create store
const store = createStore(
  persistedReducer,
  applyMiddleware(sagaMiddleware)
)

// Run sagas
sagaMiddleware.run(authSaga)

// Persistor
const persistor = persistStore(store)

export { store, persistor }
