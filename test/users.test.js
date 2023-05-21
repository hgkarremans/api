const chai = require('chai');
const mocha = require('mocha');
const chaiHttp = require('chai-http');
const server = require('../app');
const describe = mocha.describe;
const it = mocha.it;
const assert = chai.assert;
chai.use(chaiHttp);
const should = require('should');
const request = require('supertest');
const expect = chai.expect;
const pool = require('../src/util/mysql-db');
var jwt = require('jsonwebtoken');
const exp = require('constants');
const { error, Console } = require('console');

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM meal';
const RESET_INDEX = "ALTER TABLE user AUTO_INCREMENT = 1;";
const CLEAR_USER_TABLE = 'DELETE IGNORE FROM user';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM meal_participants_user';
const CLEAR_MEAL_AND_RESET_INDEX = CLEAR_MEAL_TABLE + RESET_INDEX;
const CLEAR_DB =
'DELETE IGNORE FROM meal; DELETE IGNORE FROM meal_participants_user; DELETE IGNORE FROM user;'

const INSERT_USER =
    'INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES ("Karel", "Ronaldo", 1, "ronaldo@gmail.com", "secret", "0618128342", "member", "meilustweg", "BOZ")'
const INSERT_USER2 = 'INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES ("Karel", "Ronaldo", 1, "hg.karremans@gmail.com", "secret", "0618128342", "member", "meilustweg", "BOZ")'

const INSERT_USERS =
    'INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city ) VALUES' +
    '(1, "Klaas", "Klaassen", "klaas@gmail.com", "secret", "Teststraat ", "Boz");' +
    'INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city ) VALUES' +
    '(2, "Jan", "Pieter", "existing2@gmail.com", "secret", "Teststraat ", "Boz");' +
    'INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city, isActive ) VALUES' +
    '(3, "Hans", "Hansen", "existing3@gmail.com", "secret", "Teststraat ", "Boz", false);' +
    'INSERT INTO user (id, firstName, lastName, emailAdress, password, street, city, isActive ) VALUES' +
    '(4, "Bert", "Bertus", "existing4@gmail.com", "secret", "Teststraat ", "Boz", false);'
let generatedToken = '';
let userId = 1;
jwt.sign({ userId }, 'your-secret-key', { expiresIn: "1y" }, (err, token) => {
    if (err) console.log(err);
    generatedToken = token;
    console.log(generatedToken);

});

describe('UC-201 Registreren als nieuwe user', () => {
    beforeEach((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(CLEAR_USER_TABLE, RESET_INDEX, function (err, results, fields) {
                    if (err) {
                        logger.err(err.message);
                        next();
                    }
                    if (results) {
                        // logger.info('Found', results.length, 'results');
                        conn.query(INSERT_USER, function (err, results, fields) {
                            if (err) {
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

    it('TC-201-1 - Verplicht veld ontbreekt', (done) => {
        const newUser = {
            firstName: 'Karel',
            lastName: 'Ronaldo',
            phoneNumber: '0618128342',
            isActive: 1,
            roles: 'member',
            street: 'meilustweg',
            city: 'BOZ'
        };
        chai
            .request(server)
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                chai.expect(res.body).to.be.an('object');
                let { statusCode, message, data } = res.body;
                expect(res.body.status).to.equal(400);
                expect(message).to.be.a('string').that.contains('emailAdress');
                expect(data).to.be.an('object');
                done();
            });
    });

    it('TC-201-2 - Verplicht veld ontbreekt', (done) => {
        const newUser = {
            firstName: 'Karel',
            emailAdress: 'ff@gmail.com',
            phoneNumber: '0618128342',
            isActive: 1,
            roles: 'member',
            street: 'meilustweg',
            city: 'BOZ'
        }
        chai
            .request(server)
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                expect(res.body).to.be.an('object');
                let { status, message, data } = res.body;
                expect(res.body.status).to.equal(400);
                expect(message).to.be.a('string').that.contains('lastName');
                expect(data).to.be.an('object');
                done();
            });

    });
    it('TC-201-3 - Verplicht veld ontbreekt', (done) => {
        const newUser = {
            lastName: 'Ronaldo',
            emailAdress: 'ffa@gmail.com',
            phoneNumber: '0618128342',
            isActive: 1,
            roles: 'member',
            street: 'meilustweg',
            city: 'BOZ'
        }
        chai
            .request(server)
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                expect(res.body).to.be.an('object');
                let { status, message, data } = res.body;
                expect(res.body.status).to.equal(400);
                expect(message).to.be.a('string').that.contains('firstName');
                expect(data).to.be.an('object');
                done();
            });

    });
    it('TC-201-4 - Emailadres is niet uniek', (done) => {
        const newUser = {
            firstName: 'Karel',
            lastName: 'Ronaldo',
            emailAdress: 'ronaldo@gmail.com',
            password: 'secret',
            phoneNumber: '0618128342',
            isActive: 1,
            roles: 'member',
            street: 'meilustweg',
            city: 'BOZ'
        }
        chai
            .request(server)
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                expect(res.body).to.be.an('object');
                let { status, message, data } = res.body;

                expect(res.body.statusCode).to.equal(400);
                expect(message).to.be.a('string').that.contains('Email already exists');
                expect(data).to.be.an('object');
                done();
            });

    });

    // });

    it('TC-201-5 - User succesvol geregistreerd', (done) => {
        // nieuwe user waarmee we testen
        const newUser = {
            firstName: 'Karel',
            lastName: 'Ronaldo',
            emailAdress: 'm.vandullementest@server.nl',
            password: 'secret',
            isActive: 1,
            phoneNumber: '0618128342',
            isActive: 1,
            roles: 'member',
            street: 'meilustweg',
            city: 'BOZ'
        }

        // Voer de test uit
        chai
            .request(server)
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                expect(res.body).to.be.an('object');
                let { status, message, data } = res.body;

                expect(res.body.statusCode).to.equal(200);
                expect(message).to.be.a('string').that.contains('User register endpoint');
                expect(data).to.be.an('object');
                expect(data.firstName).to.equal('Karel');
                expect(data.lastName).to.equal('Ronaldo');
                done();
            });
    });
});

describe('UC-202 Opvragen van overzicht van users', () => {
    beforeEach((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(CLEAR_USER_TABLE, function (err, results, fields) {
                    if (err) {
                        logger.err(err.message);
                        next();
                    }
                    if (results) {
                        // logger.info('Found', results.length, 'results');
                        conn.query(INSERT_USER, function (err, results, fields) {
                            if (err) {
                                logger.err(err.message);
                                next();
                            }
                            if (results) {
                                conn.query(INSERT_USER2, function (err, results, fields) {
                                    if (err) {
                                        logger.err(err.message);
                                        next();
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
    it('TC-202-1 - Toon alle gebruikers, minimaal 2', (done) => {
        // Voer de test uit
        chai
            .request(server)
            .get('/api/user')
            .end((err, res) => {
                assert(err === null);
                let { statusCode, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(res.body.statusCode).to.equal(200);
                expect(message).to.be.a('string').that.contains('User getAll endpoint');
                expect(data).to.be.an('array');
                expect(data.length).to.be.greaterThan(1);
                done();
            });
    });


    it('TC-202-2 - Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
        // Voer de test uit
        chai
            .request(server)
            .get('/api/user')
            .query({ name: 'foo', city: 'non-existent' })
            // Is gelijk aan .get('/api/user?name=foo&city=non-existent')
            .end((err, res) => {
                assert(err === null);
                expect(res.body).to.be.an('object');
                let { statusCode, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(res.body.statusCode).to.equal(200);
                expect(message).to.be.a('string').that.contains('User getAll endpoint');
                done();
            });
    });
});
//timeout
describe('UC-203 opvragen van gebruikersprofiel', () => {

    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(CLEAR_USER_TABLE, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(RESET_INDEX, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(INSERT_USER, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    it('TC-203-1 - User succesvol opgevraagd', (done) => {

        chai
            .request(server)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(res.body.statusCode).to.equal(200);
                expect(message).to.be.a('string').that.contains('User empty profile endpoint');
                done();

            });
    });

});

describe('UC-204 userId ophalen', () => {
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(CLEAR_USER_TABLE, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(RESET_INDEX, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(INSERT_USER, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });

    it('TC-204-1 - User succesvol opgevraagd', (done) => {
        const int = {
            "id": 1
        }
        chai
            .request(server)
            .get('/api/user/userId')
            .send(int)

            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(res.body.statusCode).to.equal(200);
                expect(message).to.be.a('string').that.contains('User id endpoint');
                expect(data).to.be.an('object');
                expect(data.id).to.equal(1);
                done();
            });
    });
    it('TC-204-2 - User bestaat niet', (done) => {
        const int = {
            id: 1000
        }
        chai
            .request(server)
            .get('/api/user/userId')
            .send(int)

            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(res.body.statusCode).to.equal(404);
                expect(message).to.be.a('string').that.contains('User not found');
                done();
            });
    });
});
describe('UC-205 Gebruikersinformatie wijzingen', () => {
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(CLEAR_MEAL_TABLE, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(CLEAR_USER_TABLE, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(RESET_INDEX, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(INSERT_USER, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    it('TC-205-1 - Gebruikersinformatie succesvol gewijzigd', (done) => {

        const user = {
            id: 1,
            firstName: 'Karel',
            lastName: 'Ronaldo',
            emailAdress: 'ronaldffafof@gmail.com'

        }
        chai
            .request(server)
            .put('/api/user/userId')
            .send(user)
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(res.body.statusCode).to.equal(200);
                expect(message).to.be.a('string').that.contains('User update endpoint');
                expect(data).to.be.an('object');
                expect(data.id).to.equal(1);
                done();
            });
    });
    it('TC-205-2 - Gebruikersinformatie niet gewijzigd', (done) => {

        const user = {
            id: 5000,
            firstName: 'Karel',
            lastName: 'Ronaldo',
            emailAdress: 'm.vanffdam@server.nl'
        }
        chai
            .request(server)
            .put('/api/user/userId')
            .send(user)
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(status).to.equal(400);
                expect(message).to.be.a('string').that.contains('id must be the same as the logged in user');
                expect(data).to.be.an('object');
                expect(data.id).to.equal(5000);
                done();
            });
    });
});
//timeout
describe.skip('UC-206 Verwijder de user met het opgegeven id', () => {
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(CLEAR_USER_TABLE, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(RESET_INDEX, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    before((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
            }
            if (conn) {
                conn.query(INSERT_USER, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        next();
                    }
                    if (results) {
                        done();
                    }
                });
                pool.releaseConnection(conn);
            }
        });
    });
    it('TC-206-1 - User succesvol opgevraagd', (done) => {

        const int = {
            id: 1
        }
        chai
            .request(server)
            .delete('/api/user/userId')
            .send(int)

            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                console.log(res.body);
                expect(res.body).to.be.an('object');
                expect(res.body.statusCode).to.equal(200);
                expect(message).to.be.a('string').that.contains('User delete endpoint');
                expect(data).to.be.an('object');
                expect(data.id).to.equal(1);
                done();
            });
    });
    it('TC-206-2 - User bestaat niet', (done) => {
        const int = {
            id: 1000
        }
        chai
            .request(server)
            .delete('/api/users/delete')
            .send(int)

            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(res.body.statusCode).to.equal(404);
                expect(message).to.be.a('string').that.contains('User not found');
                done();
            });
    });

});
