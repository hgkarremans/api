const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const { describe } = require('mocha');
chai.use(chaiHttp);
const should = require('should');
const request = require('supertest');
const expect = chai.expect;

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM meal';
const CLEAR_USER_TABLE = 'DELETE IGNORE FROM user';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM meal_participants_user';
const CLEAR_DB = 
    CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USER_TABLE;

const INSERT_USER = 
'INSERT INTO user (id, firstName, lastName, emailAdress) VALUES (1, "Karel", "Ronaldo", "ronaldo@gmail.com")'


describe('UC-201 Registreren als nieuwe user', () => {
    beforeEach((done) => {
        pool.getConnection((err, connection) => {
      if (err) throw err;

      // execute the check email SQL statement
      connection.query(checkEmailSql, [user.emailAdress], (err, results) => {
        if (err) throw err;
        const count = results[0].count;
        if (count === 0) {
          connection.query(sqlStatement, [user.emailAdress], (err, results) => {
            if (err) throw err;
            res.status(200).json({
              statusCode: 200,
              message: 'User register endpoint',
              data: user
            });
          });
        } else {
          res.status(400).json({
            statusCode: 400,
            message: 'Email already exists',
            data: user
          });
        }
        connection.release();
      });
    });
    });

    it('TC-201-1 - Verplicht veld ontbreekt', (done) => {
        const newUser = {
            firstName: 'Karel',
            lastName: 'Ronaldo'
        };
        chai
            .request(server)
            .post('/api/users/register')
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
            emailAdress: 'ff@gmail.com'
        }
        chai
            .request(server)
            .post('/api/users/register')
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
            emailAdress: 'ffa@gmail.com'
        }
        chai
            .request(server)
            .post('/api/users/register')
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
            emailAdress: 'm.vandullemen@server.nl'
        }
        chai
            .request(server)
            .post('/api/users/register')
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
            emailAdress: 'm.vandullementest@server.nl'
        }

        // Voer de test uit
        chai
            .request(server)
            .post('/api/users/register')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                expect(res.body).to.be.an('object');
                let { status, message, data } = res.body;
                console.log(res.body.statusCode);
                console.log(res.body.message);
                console.log(res.body.data);
                expect(res.body.status).to.equal(200);
                expect(message).to.be.a('string').that.contains('User register endpoint');
                expect(data).to.be.an('object');
                expect(data.firstName).to.equal('Karel');
                expect(data.lastName).to.equal('Ronaldo');
                done();
            });
    });

    describe('UC-202 Opvragen van overzicht van users', () => {
        it('TC-202-1 - Toon alle gebruikers, minimaal 2', (done) => {
            // Voer de test uit
            chai
                .request(server)
                .get('/api/users')
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

        //     // Je kunt een test ook tijdelijk skippen om je te focussen op andere testcases.
        //     // Dan gebruik je it.skip
        it.skip('TC-202-2 - Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
            // Voer de test uit
            chai
                .request(server)
                .get('/api/users')
                .query({ name: 'foo', city: 'non-existent' })
                // Is gelijk aan .get('/api/user?name=foo&city=non-existent')
                .end((err, res) => {
                    assert(err === null);

                    res.body.should.be.an('object');
                    let { data, message, status } = res.body;

                    status.should.equal(200);
                    message.should.be.a('string').equal('User getAll endpoint');
                    data.should.be.an('array');

                    done();
                });
        });
    });

    describe.skip('UC-203 opvragen van gebruikersprofiel', () => {
        it('TC-203-1 - User succesvol opgevraagd', (done) => {

            chai
                .request(server)
                .get('/api/userprofile')
                .end((err, res) => {
                    assert(err === null);
                    let { status, message } = res.body;
                    status.should.equal(403);
                    message.should.be.a('string').equal('Deze functionaliteit is nog niet gerealiseerd');
                    done();
                });
        });
    });

    describe('UC-204 userId ophalen', () => {
        it('TC-204-1 - User succesvol opgevraagd', (done) => {
            const int = {
                "id": 1
            }
            chai
                .request(server)
                .get('/api/users/userid')
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
                .get('/api/users/userid')
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
        it('TC-205-1 - Gebruikersinformatie succesvol gewijzigd', (done) => {

            const user = {
                id: 1,
                firstName: 'Karel',
                lastName: 'Ronaldo',
                emailAdress: 'Karel.fsfR@gmail.com'
            }
            chai
                .request(server)
                .put('/api/users/change')
                .send(user)
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
                emailAdress: 'Karel.fsfR@gmail.com'
            }
            chai
                .request(server)
                .put('/api/users/change')
                .send(user)
                .end((err, res) => {
                    assert(err === null);
                    let { status, message, data } = res.body;
                    expect(res.body).to.be.an('object');
                    expect(res.body.statusCode).to.equal(404);
                    expect(message).to.be.a('string').that.contains('User not found');
                    expect(data).to.be.an('object');
                    expect(data.id).to.equal(5000);
                    done();
                });
        });
    });

    describe('UC-206 Verwijder de user met het opgegeven id', () => {
        it('TC-206-1 - User succesvol opgevraagd', (done) => {

            const int = {
                id: 3
            }
            chai
                .request(server)
                .delete('/api/users/delete')
                .send(int)

                .end((err, res) => {
                    assert(err === null);
                    let { status, message, data } = res.body;
                    console.log(res.body.statusCode);
                    console.log(res.body);
                    expect(res.body).to.be.an('object');
                    expect(res.body.statusCode).to.equal(200);
                    expect(message).to.be.a('string').that.contains('User delete endpoint');
                    expect(data).to.be.an('object');
                    expect(data.id).to.equal(3);
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
});