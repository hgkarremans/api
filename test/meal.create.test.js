const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const { describe } = require('mocha');
chai.use(chaiHttp);
const should = require('should');
const request = require('supertest');
const expect = chai.expect;
const pool = require('../src/util/mysql-db');
const jwt = require("jsonwebtoken");
const exp = require('constants');

const RESET_INDEX_USER = "ALTER TABLE user AUTO_INCREMENT = 1;";
const RESET_INDEX_MEAL = "ALTER TABLE meal AUTO_INCREMENT = 1;";
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM meal';
const CLEAR_USER_TABLE = 'DELETE FROM user';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM meal_participants_user';
const CLEAR_DB =
    'SET FOREIGN_KEY_CHECKS = 0; DELETE IGNORE FROM `meal`; DELETE IGNORE FROM `meal_participants_user`; DELETE IGNORE FROM `user`; SET FOREIGN_KEY_CHECKS = 1;'
const INSERT_USER =
    'INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES ("Karel", "Ronaldo", 1, "ronaldo@gmail.com", "secret", "0618128342", "member", "meilustweg", "BOZ")'

const INSERT_MEAL = 'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES ' +
    "(1, 'Kaas', 'Oude Kaas', 'www.kaas.com', NOW(), 2, 3.10, 1);";

const INSERT_MEAL2 = 'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES ' +
    "(2, 'Kaas', 'Oude Kaas', 'www.kaas.com', NOW(), 2, 3.10, 2);";

const INSERT_USERS =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`) VALUES ' +
    '(1, "Klaas", "Klaassen", "existing2@gmail.com", "secret", "Teststraat 23", "Rotterdam"), ' +
    '(2, "Jan", "Pieter", "existing3@gmail.com", "secret", "Teststraat 23", "Rotterdam");';

const INSERT_USERS3 = 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `isActive` ) VALUES' +
    '(3, "Hans", "Hansen", "existing3@gmail.com", "secret", "Teststraat 23", "Rotterdam", false);'
const INSERT_USERS4 = 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `isActive` ) VALUES' +
    '(4, "Bert", "Bertus", "existing4@gmail.com", "secret", "Teststraat 23", "Rotterdam", false);'



let generatedToken = '';
let userId = 1;
jwt.sign({ userId }, 'your-secret-key', { expiresIn: "1y" }, (err, token) => {
    if (err) console.log(err);
    generatedToken = token;
    console.log(generatedToken);

});



    describe('UC-301 creeren van maaltijd', () => {
        beforeEach((done) => {
            pool.getConnection(function (err, conn) {
                // Do something with the connection
                if (err) {
                    console.log('error', err);
                    next('error: ' + err.message);
                }
                if (conn) {
                    conn.query(CLEAR_DB, function (err, results, fields) {
                        if (err) {
                            console.log('test', err);
                            console.log(err);
                            next();
                        }
                        if (results) {

                            conn.query(INSERT_USERS, INSERT_MEAL, function (err, results, fields) {
                                if (err) {
                                    console.log('we here arent we')
                                    console.log(err);
                                    logger.err(err.message);
                                    next();
                                }
                                if (results) {
                                    done();
                                }
                            });
                        }
                    });
                    pool.releaseConnection(conn);
                }
            });
        });



        it('TC-301-1 - should create a meal', (done) => {
            request(server)
                .post('/api/meal')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send({
                    isActive: 1,
                    isVega: 0,
                    isVegan: 0,
                    isToTakeHome: 1,
                    dateTime: "2022-03-22T16:35:00.000Z",
                    maxAmountOfParticipants: 4,
                    price: 12.75,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name: "Pasta Bolognese met tomaat, spekjes en kaas",
                    description: "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
                    allergenes: "gluten, lactose"
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.message).to.equal('meal create endpoint');
                    done();
                });
        }
        );
        it('TC-301-2 - should not create meal without isActive', (done) => {
            request(server)
                .post('/api/meal')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send({
                    isVega: 0,
                    isVegan: 0,
                    isToTakeHome: 1,
                    dateTime: "2022-03-22T16:35:00.000Z",
                    maxAmountOfParticipants: 4,
                    price: 12.75,
                    isActive: "ff",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name: "Pasta Bolognese met tomaat, spekjes en kaas",
                    description: "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
                    allergenes: "gluten, lactose"
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('isActive must be a number');
                    done();
                });
        }
        );
        it('TC-301-3 - should not create meal without isVega', (done) => {
            request(server)
                .post('/api/meal')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send({
                    isActive: 1,
                    isVegan: 0,
                    isToTakeHome: 1,
                    dateTime: "2022-03-22T16:35:00.000Z",
                    maxAmountOfParticipants: 4,
                    price: 12.75,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name: "Pasta Bolognese met tomaat, spekjes en kaas",
                    description: "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
                    allergenes: "gluten, lactose"
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('isVega must be a number');
                    done();
                });
        }
        );
        it('TC-301-4 - should not create meal without isVegan', (done) => {
            request(server)
                .post('/api/meal')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send({
                    isActive: 1,
                    isVegan: "ff",
                    isVega: 0,
                    isToTakeHome: 1,
                    dateTime: "2022-03-22T16:35:00.000Z",
                    maxAmountOfParticipants: 4,
                    price: 12.75,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name: "Pasta Bolognese met tomaat, spekjes en kaas",
                    description: "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
                    allergenes: "gluten, lactose"
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('isVegan must be a number');
                    done();
                });
        }
        );
        it('TC-301-5 - should not create meal without isToTakeHome', (done) => {
            request(server)
                .post('/api/meal')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send({
                    isActive: 1,
                    isVegan: 0,
                    isVega: 0,
                    isToTakeHome: "ff",
                    dateTime: "2022-03-22T16:35:00.000Z",
                    maxAmountOfParticipants: 4,
                    price: 12.75,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name: "Pasta Bolognese met tomaat, spekjes en kaas",
                    description: "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
                    allergenes: "gluten, lactose"
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('isToTakeHome must be a number');
                    done();
                });
        }
        );
        it('TC-301-6 - should not create meal without maxAmountOfParticipants', (done) => {
            request(server)
                .post('/api/meal')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send({
                    isActive: 1,
                    isVegan: 0,
                    isVega: 0,
                    isToTakeHome: 1,
                    dateTime: "2022-03-22T16:35:00.000Z",
                    maxAmountOfParticipants: "ff",
                    price: 12.75,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name: "Pasta Bolognese met tomaat, spekjes en kaas",
                    description: "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
                    allergenes: "gluten, lactose"
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('maxParticipants must be a number');
                    done();
                });
        }
        );
        it('TC-301-7 - should not create meal without price', (done) => {
            request(server)
                .post('/api/meal')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send({
                    isActive: 1,
                    isVegan: 0,
                    isVega: 0,
                    isToTakeHome: 1,
                    dateTime: "2022-03-22T16:35:00.000Z",
                    maxAmountOfParticipants: 4,
                    price: "ff",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name: "Pasta Bolognese met tomaat, spekjes en kaas",
                    description: "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
                    allergenes: "gluten, lactose"
                })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('price must be a number');
                    done();
                });
        }
        );
    });
    describe('UC-302 wijzigen van maaltijd', () => {
        beforeEach((done) => {
            pool.getConnection(function (err, conn) {
                // Do something with the connection
                if (err) {
                    console.log('error', err);
                    done('error: ' + err.message);
                }
                if (conn) {
                    conn.query(CLEAR_DB, function (err, results, fields) {
                        if (err) {
                            console.log(err);
                            done(err);
                        }
                        if (results) {
                            conn.query(INSERT_USERS, function (err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    logger.err(err.message);
                                    done(err);
                                }
                                if (results) {
                                    conn.query(INSERT_MEAL, function (err, results, fields) {
                                        if (err) {
                                            console.log(err);
                                            logger.err(err.message);
                                            done(err);
                                        }
                                        if (results) {
                                            done();
                                        }
                                    });
                                }
                            });
                        }
                    });
                    pool.releaseConnection(conn);
                }
            });
        });

        it('TC-302-1 - should update a meal', (done) => {
            request(server)
                .put('/api/meal/mealId')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send({
                    id: 1,
                    isActive: 1,
                    isVega: 0,
                    isVegan: 0,
                    isToTakeHome: 1,
                    dateTime: "2022-03-22T16:35:00.000Z",
                    maxAmountOfParticipants: 4,
                    price: 12.75,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name: "Pasta Bolognese met tomaat, spekjes en kaas",
                    description: "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
                    allergenes: "gluten, lactose",
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.message).to.equal('meal update endpoint');
                    expect(res.body.data.affectedRows).to.equal(1);
                    done();
                });
        }
        );
        it('TC-302-2 - does not exist', (done) => {
            request(server)
                .put('/api/meal/mealId')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send({
                    id: 500,
                    isActive: 1,
                    isVega: 0,
                    isVegan: 0,
                    isToTakeHome: 1,
                    dateTime: "2022-03-22T16:35:00.000Z",
                    maxAmountOfParticipants: 4,
                    price: 12.75,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name: "Pasta Bolognese met tomaat, spekjes en kaas",
                    description: "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
                    allergenes: "gluten, lactose",
                })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body.message).to.equal('meal not found');
                    expect(res.body.data.affectedRows).to.equal(0);
                    done();
                });
        }
        );
        // it('TC-302-3 - should not update a meal because not allowed', (done) => {
        //     request(server)
        //         .put('/api/meal/mealId')
        //         .set('Authorization', 'Bearer ' + generatedToken)
        //         .send({
        //             id: 2,
        //             isActive: 1,
        //             isVega: 0,
        //             isVegan: 0,
        //             isToTakeHome: 1,
        //             dateTime: "2022-03-22T16:35:00.000Z",
        //             maxAmountOfParticipants: 4,
        //             price: 12.75,
        //             imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        //             name: "Pasta Bolognese met tomaat, spekjes en kaas",
        //             description: "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
        //             allergenes: "gluten, lactose",
        //         })
        //         .end((err, res) => {
        //             expect(res).to.have.status(400);
        //             expect(res.body.message).to.equal('user is not authorized to update this meal');
        //             expect(res.body.data.id).to.equal(2);
        //             expect(res.body.data.isActive).to.equal(1);
        //             done();
        //         });
        // }
        // );
    });
    describe('UC-303 opvragen van maaltijden', () => {
        beforeEach((done) => {
            pool.getConnection(function (err, conn) {
                // Do something with the connection
                if (err) {
                    console.log('error', err);
                    done('error: ' + err.message);
                }
                if (conn) {
                    conn.query(CLEAR_DB, function (err, results, fields) {
                        if (err) {
                            console.log(err);
                            done(err);
                        }
                        if (results) {
                            conn.query(INSERT_USERS, function (err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    logger.err(err.message);
                                    done(err);
                                }
                                if (results) {
                                    conn.query(INSERT_MEAL, function (err, results, fields) {
                                        if (err) {
                                            console.log(err);
                                            logger.err(err.message);
                                            done(err);
                                        }
                                        if (results) {
                                            conn.query(INSERT_MEAL2, function (err, results, fields) {
                                                if (err) {
                                                    console.log('we here now' + err);
                                                    logger.err(err.message);
                                                    done(err);
                                                }
                                                if (results) {
                                                    done();
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    pool.releaseConnection(conn);
                }
            });
        });
        it('TC-303-1 - should get all meals', (done) => {
            request(server)
                .get('/api/meal')
                .set('Authorization', 'Bearer ' + generatedToken)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.message).to.equal('meal getAll endpoint');
                    expect(res.body.data.length).to.equal(2);
                    done();
                });
        }
        );
    });
    describe('UC-304 opvragen van maaltijd bij ID', () => {
        beforeEach((done) => {
            pool.getConnection(function (err, conn) {
                // Do something with the connection
                if (err) {
                    console.log('error', err);
                    next('error: ' + err.message);
                }
                if (conn) {
                    conn.query(CLEAR_DB, function (err, results, fields) {
                        if (err) {
                            console.log(err);
                            next();
                        }
                        if (results) {

                            conn.query(INSERT_USERS, function (err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    logger.err(err.message);
                                    next();
                                }
                                if (results) {
                                    conn.query(INSERT_MEAL, function (err, results, fields) {
                                        if (err) {
                                            logger.err(err.message);
                                            next();
                                        }
                                        if (results) {
                                            conn.query(INSERT_MEAL2, function (err, results, fields) {
                                                if (err) {
                                                    logger.err(err.message);
                                                    next();
                                                }
                                                if (results) {
                                                    done();
                                                }
                                            }
                                            );
                                        }
                                    }
                                    );
                                }
                            });
                        }
                    });
                    pool.releaseConnection(conn);
                }
            });
        });
        it('TC-304-1 - should get meal with id 1', (done) => {
            const int = {
                "id": 1
            }
            request(server)
                .get('/api/meal/mealId')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send(int)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.message).to.equal('meal id endpoint');
                    expect(res.body.data.id).to.equal(1);
                    done();
                });

        }
        );
        it('TC-304-2 - should not get meal with id 500', (done) => {
            const int = {
                "id": 500
            }
            request(server)
                .get('/api/meal/mealId')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send(int)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body.message).to.equal('meal not found');
                    expect(res.body.data).to.equal(500);
                    done();
                });
        }
        );
        it('TC-304-3 - should get meal with id 2', (done) => {
            const int = {
                "id": 2
            }
            request(server)
                .get('/api/meal/mealId')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send(int)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.message).to.equal('meal id endpoint');
                    expect(res.body.data.id).to.equal(2);
                    done();
                });

        }
        );
    });
    describe('UC-305 verwijderen van maaltijd', () => {
        beforeEach((done) => {
            pool.getConnection(function (err, conn) {
                // Do something with the connection
                if (err) {
                    console.log('error', err);
                    next('error: ' + err.message);
                }
                if (conn) {
                    conn.query(CLEAR_DB, function (err, results, fields) {
                        if (err) {
                            console.log(err);
                            next();
                        }
                        if (results) {

                            conn.query(INSERT_USERS, function (err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    logger.err(err.message);
                                    next();
                                }
                                if (results) {
                                    conn.query(INSERT_MEAL, function (err, results, fields) {
                                        if (err) {
                                            logger.err(err.message);
                                            next();
                                        }
                                        if (results) {
                                            conn.query(INSERT_MEAL2, function (err, results, fields) {
                                                if (err) {
                                                    logger.err(err.message);
                                                    next();
                                                }
                                                if (results) {
                                                    done();
                                                }
                                            }
                                            );
                                        }
                                    }
                                    );
                                }
                            });
                        }
                    });
                    pool.releaseConnection(conn);
                }
            });
        });
        it('TC-305-1 - should delete meal with id 1', (done) => {
            const int = {
                "id": 1
            }
            request(server)
                .delete('/api/meal/mealId')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send(int)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.message).to.equal('meal delete endpoint');
                    expect(res.body.data.affectedRows).to.equal(1);
                    done();
                });
        }
        );
        it('TC-305-2 - should not delete meal with id 500', (done) => {
            const int = {
                "id": 500
            }
            request(server)
                .delete('/api/meal/mealId')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send(int)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body.message).to.equal('meal not found');
                    expect(res.body.data).to.equal(500);
                    done();
                });
        }
        );
        it('TC-305-3 - should not delete meal with id 2 because not allowed', (done) => {
            const int = {
                "id": 2
            }
            request(server)
                .delete('/api/meal/mealId')
                .set('Authorization', 'Bearer ' + generatedToken)
                .send(int)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('user is not authorized to delete this meal');
                    expect(res.body.data).to.equal(2); ""

                    done();
                });
        }
        );
    });

