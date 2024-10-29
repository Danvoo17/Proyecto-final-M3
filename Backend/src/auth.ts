import jwt from 'jsonwebtoken';

const SECRET_KEY = '111333222444666555777999888'; // Cambia esto por una clave secreta más segura

export const generateToken = (userId: number) => {
    return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET_KEY);
};