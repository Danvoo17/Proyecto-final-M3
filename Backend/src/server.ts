import express, { Request, Response } from 'express';
import { query } from './database';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import { authenticateJWT } from './routes/auth';
import { generateToken } from './auth';


const app = express();
app.use(express.json());

app.use(cors());

const SECRET_KEY = '111333222444666555777999888';

type Permiso = {
    id_permiso: number,
    permiso: string,
    active: boolean
};

type Salario = {
    id_salario: number,
    salario: number,
    active: boolean
};

type Cargo = {
    id_cargo: number,
    cargo: string,
    permiso: number,
    salario: number,
    isByPass: boolean,
    active: boolean
};

type Account = {
    id_account: number,
    username: string,
    password: string,
    cargo: number,
    active: boolean
};

type Empleado = {
    id_emp: number,
    fullname: string,
    cedula: string,
    cargo: number,
    active: boolean
};

type WorkedHour = {
    empleado: number,
    horas: number,
    horasExtra: number,
    fechaCorte: string
};

type Ponche = {
    id_ponche: number,
    empleado: number,
    entrada: string,
    salida: string,
    intervalo: number,
    active: boolean
};

type Nomina = {
    id_nomina: number,
    montoBase: number,
    montoExtra: number,
    corteNomina: number,
    fecha: string,
    active: boolean
};


//////////////////////////////////////////////////////////////////////////////////
////////////////////////////////LOGIN////////////////////////////////////////////

app.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: 'Nombre de usuario y contraseña requeridos.' });
        return;
    }

    try {
        const result = await query('SELECT * FROM account WHERE username = $1 AND password = $2 AND active = true', [username, password]);

        if (result.rowCount === 0) {
            res.status(401).json({ message: 'Usuario o contraseña inválidos o cuenta inactiva.' });
            return;
        }

        const user = result.rows[0];
        const token = generateToken(user.id_account); 

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});


app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, '../../Frontend/src/views/main.html'));
});


//////////////////////////////////////////////////////////////////////////////////
////////////////////////////////PERMISO//////////////////////////////////////////

///////////////////////obtener registros///////////////////////////////////
app.get('/permiso', async (request: Request, response: Response) => {
    try {
        const result = await query('SELECT * FROM permiso WHERE active = true ORDER BY id_permiso ASC');
        response.json(result.rows);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al obtener permisos');
    }
});


///////////////////////filtrar por id///////////////////////////////////
app.get('/permiso/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }

    try {
        const result = await query('SELECT * FROM permiso WHERE id_permiso = $1', [id]);
        if (result.rowCount === 0) {
            response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }
        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al obtener el permiso');
    }
});


///////////////////////crear registro///////////////////////////////////
app.post('/permiso', async (request: Request, response: Response) => {
    const { permiso } = request.body;

    if (!permiso) {
        response.status(400).send('Error 400: El campo "permiso" es obligatorio');
        return;
    }

    try {
        const result = await query(
            'INSERT INTO permiso (permiso, active) VALUES ($1, $2) RETURNING *',
            [permiso, true]
        );
        response.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al agregar el permiso');
    }
});


///////////////////////actualizar registro///////////////////////////////////
app.put('/permiso/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);
    const { permiso, active } = request.body;

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }

    try {
        const result = await query(
            'UPDATE permiso SET permiso = $1, active = $2 WHERE id_permiso = $3 RETURNING *',
            [permiso, true, id]
        );

        if (result.rowCount === 0) {
            response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }
        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al actualizar el permiso');
    }
});


//////////////////////////desactivar registros////////////////////////
app.patch('/permiso/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }

    try {
        const result = await query(
            'UPDATE permiso SET active = false WHERE id_permiso = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }
        response.json({
            statusCode: 200,
            statusValue: 'OK',
            message: 'Permiso desactivado',
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al desactivar el permiso');
    }
});



////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////SALARIO////////////////////////////////////////////

///////////////////////obtener registros///////////////////////////////////
app.get('/salario', async (request: Request, response: Response) => {
    try {
        const result = await query('SELECT * FROM salario WHERE active = true ORDER BY id_salario ASC');
        response.json(result.rows);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al obtener los salarios');
    }
});


///////////////////////filtrar por id///////////////////////////////////
app.get('/salario/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }

    try {
        const result = await query('SELECT * FROM salario WHERE id_salario = $1', [id]);
        if (result.rowCount === 0) {
            response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }
        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al obtener el salario');
    }
});


///////////////////////crear registro///////////////////////////////////
app.post('/salario', async (request: Request, response: Response) => {
    const { salario } = request.body;

    if (salario === undefined || isNaN(salario)) {
        response.status(400).send('Error 400: El campo "salario" es obligatorio y debe ser un número');
        return;
    }

    try {
        const result = await query(
            'INSERT INTO salario (salario, active) VALUES ($1, $2) RETURNING *',
            [salario, true]
        );
        response.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al agregar el salario');
    }
});


///////////////////////actualizar registro///////////////////////////////////
app.put('/salario/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);
    const { salario, active } = request.body;

    if (isNaN(id) || salario === undefined || isNaN(salario)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'ID o salario no válidos. Asegúrese de que ambos sean números.'
        });
        return;
    }

    try {
        const result = await query(
            'UPDATE salario SET salario = $1, active = $2 WHERE id_salario = $3 RETURNING *',
            [salario, true, id]
        );

        if (result.rowCount === 0) {
            response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }
        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al actualizar el salario');
    }
});

//////////////////////////desactivar registros////////////////////////
app.patch('/salario/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }

    try {
        const result = await query(
            'UPDATE salario SET active = false WHERE id_salario = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }
        response.json({
            statusCode: 200,
            statusValue: 'OK',
            message: 'Salario desactivado',
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al desactivar el salario');
    }
});



//////////////////////////////////////////////////////////////////////////////////
////////////////////////////////CARGO/////////////////////////////////////////////

/////////////////////// Obtener todos los cargos activos ///////////////////////
app.get('/cargo', async (request: Request, response: Response) => {
    try {
        const result = await query('SELECT * FROM cargo WHERE active = true ORDER BY id_cargo ASC');
        response.json(result.rows);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al obtener cargos');
    }
});


///////////////////////Filtrar por ID//////////////////////////////////
app.get('/cargo/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
    } else {
        try {
            const result = await query('SELECT * FROM cargo WHERE id_cargo = $1 AND active = true', [id]);

            if (result.rowCount === 0) {
                response.status(404).json({
                    statusCode: 404,
                    statusValue: 'Not Found',
                    message: 'El ID ' + id + ' no fue encontrado'
                });
            } else {
                response.json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            response.status(500).send('Error al obtener el cargo');
        }
    }
});


/////////////////////////// Crear un nuevo cargo /////////////////////////////
app.post('/cargo', async (request: Request, response: Response) => {
    const { cargo, permiso, salario } = request.body;

    if (!cargo || !permiso || !salario) {
        response.status(400).send('Todos los campos son obligatorios');
    } else {
        try {
            const result = await query(
                'INSERT INTO cargo (cargo, permiso, salario, isbypass, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [cargo, permiso, salario, false, true]
            );
            response.status(201).json(result.rows[0]);
        } catch (error) {
            console.error(error);
            response.status(500).send('Error al crear el cargo');
        }
    }
});


/////////////////////////// Actualizar un cargo por ID ///////////////////////
app.put('/cargo/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);
    const { cargo, permiso, salario } = request.body;

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
    } else {
        try {
            const result = await query(
                'UPDATE cargo SET cargo = $1, permiso = $2, salario = $3, isbypass = $4, active = $5 WHERE id_cargo = $6 RETURNING *',
                [cargo, permiso, salario, false, true, id]
            );

            if (result.rowCount === 0) {
                response.status(404).json({
                    statusCode: 404,
                    statusValue: 'Not Found',
                    message: 'El ID ' + id + ' no fue encontrado'
                });
            } else {
                response.json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            response.status(500).send('Error al actualizar el cargo');
        }
    }
});


//////////////////////////desactivar registros////////////////////////
app.patch('/cargo/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
    } else {
        try {
            const result = await query(
                'UPDATE cargo SET active = false WHERE id_cargo = $1 RETURNING *',
                [id]
            );

            if (result.rowCount === 0) {
                response.status(404).json({
                    statusCode: 404,
                    statusValue: 'Not Found',
                    message: 'El ID ' + id + ' no fue encontrado'
                });
            } else {
                response.json({
                    statusCode: 200,
                    statusValue: 'OK',
                    message: 'Cargo desactivado exitosamente',
                    data: result.rows[0]
                });
            }
        } catch (error) {
            console.error(error);
            response.status(500).send('Error al desactivar el cargo');
        }
    }
});



//////////////////////////////////////////////////////////////////////////////////
////////////////////////////////ACCOUNT//////////////////////////////////////////

///////////////////////obtener registros///////////////////////////////////
app.get('/account', async (request: Request, response: Response) => {
    try {
        const result = await query('SELECT * FROM account WHERE active = true ORDER BY id_account ASC');
        response.json(result.rows);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al obtener cuentas');
    }
});


//////////////////////filtrar por id//////////////////////////////////////
app.get('/account/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
            response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }

    try {
        const result = await query('SELECT * FROM account WHERE id_account = $1', [id]);
        if (result.rowCount === 0) {
                response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }
        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al obtener la cuenta');
    }
});


///////////////////////////Crear un nuevo registro/////////////////////////////
app.post('/account', async (request: Request, response: Response) => {
    const { username, password, cargo } = request.body;

    if (!username || !password || !cargo) {
        response.status(400).send('Error 400: Todos los campos son obligatorios');
        return;
    }

    try {
        const result = await query(
            'INSERT INTO account (username, password, cargo, active) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, password, cargo, true]
        );
        response.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al crear la cuenta');
    }
});


/////////////////////////Actualizar registros/////////////////////////////////
app.put('/account/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);
    const { username, password, cargo, active } = request.body;

    if (isNaN(id)) {
            response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }

    try {
        const result = await query(
            'UPDATE account SET username = $1, password = $2, cargo = $3, active = $4 WHERE id_account = $5 RETURNING *',
            [username, password, cargo, true, id]
        );

        if (result.rowCount === 0) {
                response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }

        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al actualizar la cuenta');
    }
});


////////////////////////Desactivar registros////////////////////////////
app.patch('/account/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
            response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }

    try {
        const result = await query(
            'UPDATE account SET active = false WHERE id_account = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
                response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }

        response.json({
            statusCode: 200,
            statusValue: 'OK',
            message: 'Cuenta desactivada',
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al desactivar la cuenta');
    }
});



//////////////////////////////////////////////////////////////////////////////////
////////////////////////////////EMPLEADO/////////////////////////////////////////

///////////////////////obtener registros///////////////////////////////////
app.get('/empleado', async (request: Request, response: Response) => {
    try {
        const result = await query('SELECT * FROM empleado WHERE active = true ORDER BY id_emp ASC');
        response.json(result.rows);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al obtener los empleados');
    }
});


//////////////////////filtrar por id//////////////////////////////////////
app.get('/empleado/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);
    
    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }
    
    try {
        const result = await query('SELECT * FROM empleado WHERE id_emp = $1', [id]);
        if (result.rowCount === 0) {
            response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }
        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al obtener el empleado');
    }
});


/////////////////////////crear registros/////////////////////////////
app.post('/empleado', async (request: Request, response: Response) => {
    const { fullname, cedula, cargo } = request.body;

    if (!fullname || !cedula || !cargo) {
        response.status(400).send('Error 400: Todos los campos son obligatorios');
        return;
    }

    try {
        const cedulaExistente = await query('SELECT * FROM empleado WHERE cedula = $1', [cedula]);
        if (cedulaExistente.rowCount > 0) {
            response.status(409).json({ 
                statusCode: 409,
                statusValue: 'Conflict',
                message: 'La cédula ya está registrada'
            });
            return;
        }

        const result = await query(
            'INSERT INTO empleado (fullname, cedula, cargo, active) VALUES ($1, $2, $3, $4) RETURNING *',
            [fullname, cedula, cargo, true]
        );
        response.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al agregar empleado');
    }
});


////////////////////////actualizar registros///////////////////////////////
app.put('/empleado/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);
    const { fullname, cedula, cargo, active } = request.body;

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }

    try {
        const cedulaExistente = await query('SELECT * FROM empleado WHERE cedula = $1 AND id_emp <> $2', [cedula, id]);
        if (cedulaExistente.rowCount > 0) {
            response.status(409).json({ 
                statusCode: 409,
                statusValue: 'Conflict',
                message: 'La cédula ya está registrada'
            });
            return;
        }

        const result = await query(
            'UPDATE empleado SET fullname = $1, cedula = $2, cargo = $3, active = $4 WHERE id_emp = $5 RETURNING *',
            [fullname, cedula, cargo, active, id]
        );

        if (result.rowCount === 0) {
            response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }

        response.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al actualizar el empleado');
    }
});


//////////////////////////desactivar registros////////////////////////
app.patch('/empleado/:id', async (request: Request, response: Response) => {
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El ID proporcionado no es válido. Debe ser un número.'
        });
        return;
    }

    try {
        const result = await query(
            'UPDATE empleado SET active = false WHERE id_emp = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            response.status(404).json({
                statusCode: 404,
                statusValue: 'Not Found',
                message: 'El ID ' + id + ' no fue encontrado'
            });
            return;
        }

        response.json({
            statusCode: 200,
            statusValue: 'OK',
            message: 'Empleado desactivado',
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        response.status(500).send('Error al desactivar el empleado');
    }
});



///////////////////////////////////////////////////////////////////////////////
////////////////////////////////Configuracion de Puerto///////////////////////
const port = process.env.PORT || 5100;
app.listen(port, () => {
    console.log('Servidor corriendo en el puerto ' + port);
});
