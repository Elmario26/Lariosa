import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist/es/persistReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createSagaMiddleware from "redux-saga";
import auth from "./authReducer";

// config
const sagaMiddleware = createSagaMiddleware();
const rootPersistConfig = {
    key: 'root',
    storage: AsyncStorage,
    blacklist:['auth'],
}

const authPersistConfig = {
    key: 'auth',
    storage: AsyncStorage,
    backlist:[],
}

// Setup Reducers
const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, auth),
    
})

const persistedReducer = persistReducer(rootPersistConfig, rootReducer)

export default () => {
    let store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));
    let persistor = persistStore(store);
    let runSaga = sagaMiddleware.run;
    return { store, persistor, runSaga };
};