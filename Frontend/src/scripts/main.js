import store from '../store/store';

if (!store.getState().isAuthenticated) {
    alert('Debes iniciar sesión para acceder a esta página.');
    window.location.href = '/login';
}