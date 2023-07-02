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

const CLEAR_USER_TABLE = 'DELETE IGNORE FROM user';

const INSERT_USER =
    'INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city) VALUES ("Karel", "Ronaldo", 1, "ronaldo2334@gmail.com", "secret", "0618128342", "meilustweg", "BOZ")';


describe('UC-101 inloggen', () => {
    beforeEach((done) => {
        pool.getConnection(function (err, conn) {
            // Do something with the connection
            if (err) {
                console.log('error', err);
                done('error: ' + err.message);
            }
            if (conn) {
                conn.query(CLEAR_USER_TABLE, function (err, results, fields) {
                    if (err) {
                        console.error(err.message);
                        done();
                    }
                    if (results) {
                        conn.query(INSERT_USER, function (err, results, fields) {
                            if (err) {
                                console.error(err.message);
                                done();
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

    it('TC-101-1 login met fout email', (done) => {
        const user = {
            emailAdress: 'ronaldogmai',
            password: 'secret'
        };
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('Email address must be valid');
                done();
            });
    });

    it('TC-101-2 password as number', (done) => {
        const user = {
            emailAdress: 'ronaldo@gmail.com',
            password: 1234
        };
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('password must be a string');
                done();
            });
    });

    it('TC-101-3 login zonder wachtwoord', (done) => {
        const user = {
            emailAdress: 'ronaldogmai',
        };
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('password must be provided in request');
                done();
            });
    });

    it('TC-101-4 login zonder email', (done) => {
        const user = {
            password: 'secret'
        };
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('emailaddress must be provided in request');
                done();
            });
    });

    it('TC-101-5 geslaagde login', (done) => {
        const user = {
            emailAdress: "ronaldo2334@gmail.com",
            password: "secret"
        };
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                console.log(res.body);
                expect(res).to.have.status(200);
                expect(res.body.message).to.equal('User login endpoint');
                expect(res.body.data).to.be.a('string');
                done();
            });
    });

});