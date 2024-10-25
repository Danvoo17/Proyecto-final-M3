import express, { Request, Response } from 'express';
const app = express()

app.use(express.json());


type Employee = {
    id: number,
    username: string,
    fullname: string,
    cedula: string,
    pricePerHour: number,
    active: string
};

type WorkedHour = {
    employeeId: number,
    hours: number,
    active: string
};

type Cargo = {
    id: number,
    title: string,
    salary: number,
    active: string
};

type Salary = {
    employeeId: number,
    baseSalary: number,
    extraHours: number,
    totalSalary: number,
    active: string
};

type Permiso = {
    id: number,
    description: string,
    isActive: boolean,
    active: string
};

type Nomina = {
    id: number,
    employeeId: number,
    totalHours: number,
    extraHours: number,
    totalPayment: number,
    payDate: Date,
    active: string
};

const employees: Employee[] = [];
const workedHours: WorkedHour[] = [];
const cargos: Cargo[] = [];
const salaries: Salary[] = [];
const permisos: Permiso[] = [];
const nominas: Nomina[] = [];


//////////////////////////////////////////////////////////////////////////////////
////////////////////////////////Obtener registros////////////////////////////////
app.get('/employee', (request: Request, response: Response) => {
    const activeEmployees = employees.filter(e => e.active === 's');
    response.json(activeEmployees);
});

///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
////////////////////////////////Filtrar por ID////////////////////////////////
app.get('/employee/:id', (request: Request, response: Response) => {
    const id = parseInt(request.params.id);
    const employee = employees.find((u: Employee) => u.id === id);

    const employeeIndex = employees.findIndex((u: Employee) => u.id === id);

    if (isNaN(id)) {
            response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El id proporcionado no es válido. Debe ser un número.'
        });
    }

    if (employeeIndex === -1) {
            response.status(404).json({
            statusCode: 404,
            statusValue: 'Not Found',
            message: 'El id '+ id +' no fue encontrado'
        })
    }

        response.json({
        statusCode: 200,
        statusValue: 'OK',
        data: employee
    });
});


//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////Crear nuevo registro///////////////////////
let employeeId = 0;
app.post('/employee', (request: Request, response: Response) => {
    const { username, fullname, cedula, pricePerHour } = request.body;

    if (!username || !fullname || !cedula || !pricePerHour) {
        response.status(400).send('Error 400: Tienes que completar todos los campos');
    }
    else {   //hice todos estos else if porque el id_secuence se estaba incrementando aunque diera error
        const employeeExistente = employees.find(employees => employees.username === username);

        if (employeeExistente) {
            response.status(400).send('Error 400: El username ya está en uso');
        } else {
            employeeId += 1;

            const newEmployee = {
                id: employeeId,
                username,
                fullname,
                cedula,
                pricePerHour,
                active: "s"
            }
    
            employees.push(newEmployee);
            response.status(201).json(newEmployee);
        }
    }
});


/////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////Actualizar los registros////////////////////////////////
app.put('/employee/:id', (request: Request, response: Response) => {
    const id = parseInt(request.params.id);
    const { username, fullname, cedula, pricePerHour, active } = request.body;
    const employeeIndex = employees.findIndex((u: Employee) => u.id === id);

    if (isNaN(id)) {
            response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El id proporcionado no es válido. Debe ser un número.'
        });
    }   

    if (employeeIndex === -1) {
            response.status(404).json({
            statusCode: 404,
            statusValue: 'Not Found',
            message: 'El id '+ id +' no fue encontrado'
        })
    }

    const updatedEmployee: Employee = {
        id,
        username,
        fullname,
        cedula,
        pricePerHour,
        active: "s"
    }

    employees[employeeIndex] = updatedEmployee;

    response.json({
        statusCode: 200,
        statusValue: 'OK',
        data: updatedEmployee
    });
});


/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////Borrar los registros////////////////////////////////
app.patch('/employee/:id', (request: Request, response: Response) => {
    const id = parseInt(request.params.id);
    const employeeIndex = employees.findIndex((u: Employee) => u.id === id);

    if (isNaN(id)) {
        response.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            message: 'El id proporcionado no es válido. Debe ser un número.'
        });
    }
    else if (employeeIndex === -1) {
        response.status(404).json({
            statusCode: 404,
            statusValue: 'Not Found',
            message: 'El empleado con el id ' + id + ' no fue encontrado.'
        });
    }
    else { 
        employees[employeeIndex].active = 'n';

        response.json({
            statusCode: 200,
            statusValue: 'OK',
            message: 'Empleado desactivado',
            data: employees[employeeIndex]
        });
    }
});


///////////////////////////////////////////////////////////////////////////////
////////////////////////////////Configuracion de Puerto///////////////////////
const port = process.env.PORT || 5100;
app.listen(port, () => {
    console.log('Servidor corriendo en el puerto ' + port);
});