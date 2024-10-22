import express, { Request, Response } from 'express';
const app = express()


app.use(express.json());


type User = {
    id: number,
    username: string,
    fullname: string
}


let id_secuence = 0;
const users: User[] = [];
// endpoint
app.get('/users', (request: Request, response: Response) => {
    response.json(users);
});

app.get('/users/:username', (request: Request, response: Response) => {
    const username = request.params.username;

    const user = users.find((u: User) => u.username === username);

    if (!user) {
        return response.status(404).json({
            statusCode: 404,
            statusValue: 'Not Found',
            message: `The user with username ${username} was not found`
        })
    }

    response.json({
        statusCode: 200,
        statusValue: 'OK',
        data: user
    });
});

app.post('/users', (request: Request, response: Response) => {
    const { username, fullname } = request.body;

    id_secuence += 1;

    const newUser = {
        id: id_secuence,
        username,
        fullname
    }

    users.push(newUser);

    response.status(201).json(newUser);
});

const puerto = app.listen(5100);
console.log('Servidor corriendo en el puerto ' + puerto);
