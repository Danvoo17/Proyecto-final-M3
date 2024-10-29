import createStore from 'unistore';

// Estado inicial
const initialState = {
    user: null, // Guarda datos del usuario (como ID o nombre)
    isAuthenticated: false // Indicador de autenticación
};

// Crear el store
const store = createStore(initialState);

export default store;