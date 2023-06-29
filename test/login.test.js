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

const CLEAR_USER_TABLE = 'DELETE IGNORE FROM user';

const INSERT_USER =
    'INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES ("Karel", "Ronaldo", 1, "ronaldo2@gmail.com", "secret", "0618128342", "member", "meilustweg", "BOZ")';


describe('UC-101 inloggen', () => {
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
            emailAdress: 'ronaldogmail.com',
            password: 'secret'
        };
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {


                done();
            });
    });
});


