const express = require('express')
const assert = require('assert');
const { userInfo } = require('os');

const app = express()
const port = 3000

app.use(express.json());
let database = {
    users: [
        {
            id: 0,
            firstName: 'Hendrik',
            lastName: "van Dam",
            emailAddress: 'hvd@server.nl'
        },
        {
            id: 1,
            firstName: 'Marieke',
            lastName: 'Jansen',
            emailAdress: 'm@server.nl'
        }
    ]
};

let index = database.users.length;


app.get('/api/info', (req, res) => {
    res.status(201).json({
        status: 201,
        message: 'Server info-endpoint',
        data: {
            studentName: 'Hans Gerard Karremans',
            studentNumber: 2188909,
            description: 'Welkom bij de server API van de share a meal.'
        }
    });
});

// UC-201 registeren van een nieuwe user
app.post('/api/register', (req, res) => {
    const user = req.body;
    const email = user.emailAddress;

    console.log('user= ', user);
    //validate incoming user info
    try {
        assert(typeof user.firstName === 'string', 'firstName must be a string');
        assert(
            typeof user.emailAddress === 'string',
            'emailAddress must be a string'
        );
    } catch (err) {
        res.status(400).json({
            status: 400,
            message: err.message.toString(),
            data: {}
        });
        return;
    }

    //checken of er een identieke email in zit
    if (database['users'].some(user => user.emailAddress === email)) {
        console.log("A user with this email address already exists.");
        res.status(400).json({
            status: 400,
            message: `User met email ${user.emailAddress} bestaat al`,
            data: user
        });
    } else {
        user.id = index++;
        // User toevoegen aan database
        database['users'].push(user);
        console.log(user.emailAddress);

        // Stuur het response terug
        res.status(200).json({
            status: 200,
            message: `User met id ${user.id} is toegevoegd`,
            data: user
        });
    }
});

// UC-202 retourneren van de lijst met users
app.get('/api/users', (req, res) => {
    
    // Stuur het response terug
    res.status(200).json({
        status: 200,
        message: `Users geretourneerd.`,
        data: database['users']
    });

});

//UC-203 gebruikersprofiel ophalen
app.get('/api/userprofile', (req, res) => {

    // Stuur het response terug
    res.status(403).json({
        status: 403,
        message: `Deze functionaliteit is nog niet gerealiseerd`,
    });
});

//UC-204 userId ophalen
app.get('/api/user/userid', (req, res) => {

    const id = req.body.id;
    //checken of er een identieke id in zit
    for (let i = 0; i < database['users'].length; i++) {
        let obj = database['users'][i];
        if (obj.id == id) {
            res.status(200).json({
                status: 200,
                message: `There is a user with the id ${id}`,
                data: obj
            })
        }

    } res.status(400).json({
        status: 400,
        message: `There is no user with id ${id}`
    })
});

//UC-205 gebruikersinformatie wijzigen
app.put('/api/user/change', (req, res) => {
    const user = req.body;

    //checken of er een identieke id in zit
    for (let i = 0; i < database['users'].length; i++) {
        let obj = database['users'][i];

        if (obj.id == user.id) {
            database['users'][i] = user;
            res.status(200).json({
                status: 200,
                message: `Changed the user with the id ${user.id}`,
                data: obj
            });
        }
    } res.status(400).json({
        status: 400,
        message: `There is no user with id ${user.id}`
    })
});

//UC-206 verwijder de user bij de opgegeven user id
app.delete('/api/user/delete', (req, res) => {
    const id = req.body.id;

    //checken of er een identieke id in zit
    for (let i = 0; i < database['users'].length; i++) {
        let obj = database['users'][i];

        if (obj.id == id) {
            const removed = database['users'].slice(i);
            database['users'] = removed;
            res.status(200).json({
                status: 200,
                message: `Deleted the user with the id ${id}`,
                data: obj
            });
        }
    } res.status(400).json({
        status: 400,
        message: `There is no user with id ${id}`
    })
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
module.exports = app;