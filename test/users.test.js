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
const logger = require('../src/util/utils').logger;

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM meal';
const RESET_INDEX = "ALTER TABLE user AUTO_INCREMENT = 1;";
const CLEAR_USER_TABLE = 'DELETE IGNORE FROM user';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM meal_participants_user';
const CLEAR_MEAL_AND_RESET_INDEX = CLEAR_MEAL_TABLE + RESET_INDEX;
const CLEAR_DB =
    'DELETE IGNORE FROM meal; DELETE IGNORE FROM meal_participants_user; DELETE IGNORE FROM user;'

const INSERT_USER =
    'INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city) VALUES ("Karel", "Ronaldo", 1, "ronald1o@gmail.com", "secret", "0618128342", "meilustweg", "BOZ")'
const INSERT_USER2 = 'INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city) VALUES ("Karel", "Ronaldo", 1, "hg.karremans@gmail.com", "secret", "0618128342", "meilustweg", "BOZ")'

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
    // console.log(generatedToken);

});




describe('UC-201 Registreren als nieuwe user', () => {
    beforeEach((done) => {
        let hasError = false; // Track if an error has occurred

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error', err);
                hasError = true;
                return done('error: ' + err.message);
            }

            conn.query(CLEAR_USER_TABLE, RESET_INDEX, function (err, results, fields) {
                if (err) {
                    console.log('test', err);
                    console.log(err);
                    conn.release();
                    hasError = true;
                    return done('error: ' + err.message);
                }

                conn.query(INSERT_USER, function (err, results, fields) {
                    conn.release();
                    if (err) {
                        console.log('we here arent we');
                        console.log(err);
                        logger.err(err.message);
                        hasError = true;
                        return done('error: ' + err.message);
                    }

                    if (!hasError) {
                        // Only call done() if no error occurred
                        return done();
                    }
                });
            });
        });
    });



    it('TC-201-1 - Verplicht veld ontbreekt', (done) => {
        const newUser = {
            firstName: 'Karel',
            lastName: 'Ronaldo',
            phoneNumber: '0618128342',
            isActive: 1,
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
            emailAdress: 'ronald1o@gmail.com',
            password: 'secret',
            phoneNumber: '0618128342',
            isActive: 1,
            street: 'meilustweg',
            city: 'BOZ'
        }
        chai
            .request(server)
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                console.log
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
            firstName: "Karel",
            lastName: "Ronaldo",
            isActive: 1,
            emailAdress: "Karel.fsfsfffR@gmail.com",
            password: "secret",
            phoneNumber: "064343434",
            roles: "member",
            street: "meilustweg",
            city: "BOZ"
        };


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
       chai
            .request(server)
            .get('/api/user')
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { statusCode, message, data } = res.body;
                expect(message).to.be.a('string').that.contains('User getAll endpoint');
                expect(statusCode).to.equal(200);
                expect(data).to.be.an('array').that.has.lengthOf.at.least(2);
                done();
            });
    });


    it('TC-202-2 - Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
        
        const filter= {
            firstName: "Karel",
            lastName: "Ronaldo",
            
        };
        // Voer de test uit
        chai
            .request(server)
            .get('/api/user')
            .set('Authorization', `Bearer ${generatedToken}`)
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

    it('TC-202-3 - Toon gebruikers met zoekterm op bestaande velden', (done) => {
        const filter= {
            "isActive" : 0
        }
        // Voer de test uit
        chai
            .request(server)
            .get('/api/user')
            .send(filter)
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { statusCode, message, data } = res.body;
                expect(statusCode).to.equal(200);
                expect(message).to.be.a('string').that.equals('User getAll endpoint');
                done();
            });
    }
    );
    it('TC-202-4 - Toon gebruikers met zoekterm op bestaande velden', (done) => {
        const filter= {
            "isActive" : 1
        }
        // Voer de test uit
        chai
            .request(server)
            .get('/api/user')
            .send(filter)
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                // expect(res.body).to.be.an('object');
                let { statusCode, message, data } = res.body;
                // expect(res.body).to.be.an('object');
                expect(res.body.statusCode).to.equal(200);
                expect(message).to.be.a('string').that.equals('User getAll endpoint');
                done();
            });
    }
    );

    it('TC-202-5 - Toon gebruikers met zoekterm op bestaande velden', (done) => {
        const filter= {
            "isActive" : 1,
            "emailAdress": "ronald1o@gmail.com"
        }
        // Voer de test uit
        chai
            .request(server)
            .get('/api/user')
            .send(filter)
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                // expect(res.body).to.be.an('object');
                let { statusCode, message, data } = res.body;
                // expect(res.body).to.be.an('object');
                expect(statusCode).to.equal(200);
                expect(message).to.be.a('string').that.equals('User getAll endpoint');
                done();
            });
    }
    );
    it('TC-202-6 - Toon gebruikers met meer dan 2 filters', (done) => {
        const filter= {
            "isActive" : 1,
            "emailAdress": "ronald1o@gmail.com",
            "firstName": "Karel"
        }
        // Voer de test uit
        chai
            .request(server)
            .get('/api/user')
            .send(filter)
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(status).to.equal(400);
                expect(message).to.be.a('string').that.equals('Maximum of 2 filters allowed');
                expect(data).to.be.an('object');
                done();
            });
    }
    );


});

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
            .get('/api/user/profile/1')
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { statusCode, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(statusCode).to.equal(200);
                expect(message).to.be.a('string').that.contains('User profile endpoint');
                done();

            });
    });
    it('TC-203-2 - User niet zelfde als gebruiker', (done) => {
            
            chai
                .request(server)
                .get('/api/user/profile/1000')
                .set('Authorization', `Bearer ${generatedToken}`)
                .end((err, res) => {
                    assert(err === null);
                    let { status, message, data } = res.body;
                    expect(res.body).to.be.an('object');
                    expect(res.body.status).to.equal(403);
                    expect(message).to.be.a('string').that.contains('Forbidden');
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
        chai 
            .request(server)
            .get('/api/user/1')
            .set('Authorization', `Bearer ${generatedToken}`)
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
        chai
            .request(server)
            .get('/api/user/1000')
            .set('Authorization', `Bearer ${generatedToken}`)

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
            firstName: 'Karel',
            lastName: 'Ronaldo',
            emailAdress: 'ronaldffafof@gmail.com',
            isActive: 1,
            password: 'secret',
            street: 'meilustweg'
            

        }
        chai
            .request(server)
            .put('/api/user/1')
            .send(user)
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(res.body.statusCode).to.equal(200);
                expect(message).to.be.a('string').that.contains('User update endpoint');
                expect(data).to.be.an('object');
                done();
            });
    });
    it('TC-205-2 - Gebruikersinformatie niet gewijzigd', (done) => {

        const user = {
            firstName: 'Karel',
            lastName: 'Ronaldo',
            emailAdress: 'm.vanffdam@server.nl',
            isActive: 1,
            password: 'secret',
            street: 'meilustweg'
        }
        chai
            .request(server)
            .put('/api/user/2')
            .send(user)
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(status).to.equal(403);
                expect(message).to.be.a('string').that.contains('Forbidden');
                done();
            });
    });
});

describe('UC-206 Verwijder de user met het opgegeven id', () => {
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
                        console.log('test', err);
                        console.log(err);
                        next();
                    }
                    if (results) {

                        conn.query(INSERT_USERS, function (err, results, fields) {
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

    it('TC-206-1 - User succesvol opgevraagd', (done) => {

        chai
            .request(server)
            .delete('/api/user/1')
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(res.body.statusCode).to.equal(200);
                expect(message).to.be.a('string').that.contains('User delete endpoint');
                done();
            });
    });
    it('TC-206-2 - User niet hetzelfde als ingelogde user', (done) => {
        
        chai
            .request(server)
            .delete('/api/user/200')
            .set('Authorization', `Bearer ${generatedToken}`)
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                expect(res.body).to.be.an('object');
                expect(res.body.status).to.equal(403);
                expect(message).to.be.a('string').that.contains('Forbidden');
                done();
            });
    });

});

