import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../database'; // Asegúrate de que la ruta sea correcta

const SECRET_KEY = '111333222444666555777999888'; // Cambia esto por una clave más segura y mantenla privada

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No se proporcionó un token.' }); // Mejorar el mensaje
    }

    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: 'Token no válido o expirado.' }); // Mejorar el mensaje
        }
        req.user = user;
        next();
    });
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: 'Nombre de usuario y contraseña requeridos' });
        return;
    }

    try {
        const result = await query('SELECT * FROM account WHERE username = $1 AND password = $2 AND active = true', [username, password]);
        
        if (result.rowCount === 0) {
            res.status(401).json({ message: 'Usuario o contraseña invalidos' });
            return;
        }

        const user = result.rows[0];

        const token = jwt.sign({ id: user.id_account, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al autenticar' });
    }
};