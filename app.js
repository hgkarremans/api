const express = require('express')
const assert = require('assert');
const userRouters = require('./src/routes/user.routes');

const app = express()
const port = 3000

app.use(express.json());


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
app.use('/api/users', userRouters);

//UC-203 gebruikersprofiel ophalen
app.get('/api/userprofile', (req, res) => {

    // Stuur het response terug
    res.status(403).json({
        status: 403,
        message: `Deze functionaliteit is nog niet gerealiseerd`,
    });
});


// //UC-205 gebruikersinformatie wijzigen
// app.put('/api/user/change', (req, res) => {
//     const user = req.body;

//     //checken of er een identieke id in zit
//     for (let i = 0; i < database['users'].length; i++) {
//         let obj = database['users'][i];

//         if (obj.id == user.id) {
//             database['users'][i] = user;
//             res.status(200).json({
//                 status: 200,
//                 message: `Changed the user with the id ${user.id}`,
//                 data: obj
//             });
//         }
//     } res.status(400).json({
//         status: 400,
//         message: `There is no user with id ${user.id}`
//     })
// });

// //UC-206 verwijder de user bij de opgegeven user id
// app.delete('/api/user/delete', (req, res) => {
//     const id = req.body.id;

//     //checken of er een identieke id in zit
//     for (let i = 0; i < database['users'].length; i++) {
//         let obj = database['users'][i];

//         if (obj.id == id) {
//             const removed = database['users'].slice(i);
//             database['users'] = removed;
//             res.status(200).json({
//                 status: 200,
//                 message: `Deleted the user with the id ${id}`,
//                 data: obj
//             });
//         }
//     } res.status(400).json({
//         status: 400,
//         message: `There is no user with id ${id}`
//     })
// });
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
module.exports = app;