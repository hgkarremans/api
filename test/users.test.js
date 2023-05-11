const chai = require('chai');
const mocha = require('mocha');
const chaiHttp = require('chai-http');
const server = require('../app');
const describe = mocha.describe;
const it = mocha.it;
const assert = chai.assert;
chai.use(chaiHttp);
const expect = chai.expect;


describe('UC-201 Registreren als nieuwe user', () => {
    
    it('TC-201-1 - Verplicht veld ontbreekt', (done) => {
        const newUser = {
            firstName: 'Karel',
            lastName: 'Ronaldo'
        }
        chai
            .request(server)
            .post('/api/register')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                expect(res.body).to.be.an('object');
                let { status, message, data } = res.body;
                expect(status).to.equal(400);
                expect(message).to.be.a('string').that.contains('emailAdress');
                expect(data).to.be.an('object');
            });

        done();
    });
    
    it('TC-201-2 - Verplicht veld ontbreekt', (done) => {
        const newUser = {
            firstName: 'Karel',
            emailAdress: 'karel@gmail.com'
        }
        chai
            .request(server)
            .post('/api/register')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                expect(res.body).to.be.an('object');
                let { status, message, data } = res.body;
                expect(status).to.equal(400);
                expect(message).to.be.a('string').that.contains('lastName');
                expect(data).to.be.an('object');
            });
        done();
    });
    it('TC-201-3 - Verplicht veld ontbreekt', (done) => {
        const newUser = {
            lastName: 'Ronaldo',
            emailAdress: 'ronaldo@gmail.com'
        }
        chai
            .request(server)
            .post('/api/register')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                expect(res.body).to.be.an('object');
                let { status, message, data } = res.body;
                
                expect(message).to.be.a('string').that.contains('firstName');
                expect(data).to.be.an('object');
            });
        done();
    });
    it('TC-201-4 - Emailadres is niet uniek', (done) => {
        const newUser = {
            firstName: 'Karel',
            lastName: 'Ronaldo',
            emailAdress: 'm.vandullemen@server.nl'
        }
        chai
            .request(server)
            .post('/api/register')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                
                expect(res.body).to.be.an('object');
                let { status, message, data } = res.body;
                
                
                expect(message).to.be.a('string').that.contains('Email already exists');
                expect(data).to.be.an('object');
            });
        done();
    });

// });

it('TC-201-5 - User succesvol geregistreerd', (done) => {
    // nieuwe user waarmee we testen
    const newUser = {
        firstName: 'Karel',
        lastName: 'Ronaldo',
        emailAdress: 'Karel.R@gmail.com'
    }

    // Voer de test uit
    chai
        .request(server)
        .post('/api/register')
        .send(newUser)
        .end((err, res) => {
            assert(err === null);
            expect(res.body).to.be.an('object');
            let { status, message, data } = res.body;
            expect(status).to.equal(200);
            expect(message).to.be.a('string').that.contains('User register endpoint');
            expect(data).to.be.an('object');
            expect(data.firstName).to.equal("Karel");
            expect(data.lastName).to.equal("Ronaldo");
            done();
        });
});

// describe('UC-202 Opvragen van overzicht van users', () => {
//     it('TC-202-1 - Toon alle gebruikers, minimaal 2', (done) => {
//         // Voer de test uit
//         chai
//             .request(server)
//             .get('/api/users')
//             .end((err, res) => {
//                 assert(err === null);
//                 let { status, message, data } = res.body;
//                 status.should.equal(200);
//                 message.should.be.a('string').equal('User getAll endpoint');
//                 done();
//             });
//     });
//     // Je kunt een test ook tijdelijk skippen om je te focussen op andere testcases.
//     // Dan gebruik je it.skip
//     it.skip('TC-202-2 - Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
//         // Voer de test uit
//         chai
//             .request(server)
//             .get('/api/users')
//             .query({ name: 'foo', city: 'non-existent' })
//             // Is gelijk aan .get('/api/user?name=foo&city=non-existent')
//             .end((err, res) => {
//                 assert(err === null);

//                 res.body.should.be.an('object');
//                 let { data, message, status } = res.body;

//                 status.should.equal(200);
//                 message.should.be.a('string').equal('User getAll endpoint');
//                 data.should.be.an('array');

//                 done();
//             });
//     });
// });

// describe('UC-203 opvragen van gebruikersprofiel', () => {
//     it('TC-203-1 - User succesvol opgevraagd', (done) => {

//         chai
//             .request(server)
//             .get('/api/userprofile')
//             .end((err, res) => {
//                 assert(err === null);
//                 let { status, message } = res.body;
//                 status.should.equal(403);
//                 message.should.be.a('string').equal('Deze functionaliteit is nog niet gerealiseerd');
//                 done();
//             });
//     });
// });

// describe('UC-204 userId ophalen', () => {
//     it('TC-204-1 - User succesvol opgevraagd', (done) => {
//         const int = {
//             "id": 1
//         }
//         chai
//             .request(server)
//             .get('/api/users/userid')
//             .send(int)

//             .end((err, res) => {
//                 assert(err === null);
//                 let { status, message, data } = res.body;
//                 status.should.equal(200);
//                 message.should.be.a('string').that.contains('There is');
//                 data.should.be.an('object');
//                 data.id.should.equal(1);
//                 done();
//             });
//     });
//     it('TC-204-2 - User bestaat niet', (done) => {
//         const int = {
//             "id": 1000
//         }
//         chai
//             .request(server)
//             .get('/api/users/userid')
//             .send(int)

//             .end((err, res) => {
//                 assert(err === null);
//                 let { status, message, data } = res.body;
//                 status.should.equal(400);
//                 message.should.be.a('string').that.contains('There is');
//                 data.should.be.an('object');
//                 data.id.should.equal(1000);
//                 done();
//             });
//     });
// });
//     describe('UC-205 Gebruikersinformatie wijzingen', () => {
//         it('TC-205-1 - Gebruikersinformatie succesvol gewijzigd', (done) => {

//             const user = {
//                 "id": 0,
//                 "firstName": "Karel",
//                 "lastName": "Ronaldo",
//                 "emailAdress": "Karel.R@gmail.com"
//             }
//             chai
//                 .request(server)
//                 .put('/api/user/change')
//                 .send(user)
//                 .end((err, res) => {
//                     assert(err === null);
//                     let { status, message, data } = res.body;
//                     status.should.equal(200);
//                     message.should.be.a('string').that.contains('Changed the user');
//                     data.should.be.an('object');
//                     data.id.should.equal(0);
//                     done();
//                 });
//         });
//         it('TC-205-2 - Gebruikersinformatie niet gewijzigd', (done) => {

//             const user = {
//                 "id": 1000,
//                 "firstName": "Karel",
//                 "lastName": "Ronaldo",
//                 "emailAdress": "karel@gmail.com"
//             }
//             chai
//                 .request(server)
//                 .put('/api/users/change')
//                 .send(user)
//                 .end((err, res) => {
//                     assert(err === null);
//                     let { status, message, data } = res.body;
//                     status.should.equal(400);
//                     message.should.be.a('string').that.contains('There is');
//                     data.should.be.an('object');
//                     data.id.should.equal(1000);
//                     done();
//                 });
//         });
//     });

//     describe('UC-206 Verwijder de user met het opgegeven id', () => {
//         it('TC-206-1 - User succesvol opgevraagd', (done) => {

//             const int = {
//                 id: 1
//             }
//             chai
//                 .request(server)
//                 .delete('/api/users/delete')
//                 .send(int)

//                 .end((err, res) => {
//                     assert(err === null);
//                     let { status, message, data } = res.body;
//                     status.should.equal(200);
//                     message.should.be.a('string').that.contains('There is');
//                     data.should.be.an('object');
//                     data.id.should.equal(1);
//                     done();
//                 });
//         });
//         it('TC-206-2 - User bestaat niet', (done) => {
//             const int = {
//                 id: 1000
//             }
//             chai
//                 .request(server)
//                 .delete('/api/users/delete')
//                 .send(int)

//                 .end((err, res) => {
//                     assert(err === null);
//                     let { status, message, data } = res.body;
//                     status.should.equal(400);
//                     message.should.be.a('string').that.contains('There is');
//                     data.should.be.an('object');
//                     data.id.should.equal(1000);
//                     done();
//                 });
//         });
    });
