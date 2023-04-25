const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const { describe } = require('mocha');

chai.should();
chai.use(chaiHttp);

describe('UC-201 Registreren als nieuwe user', () => {
    it('TC-201-1 - Verplicht veld ontbreekt', (done) => {
        // Testen die te maken hebben met authenticatie of het valideren van
        // verplichte velden kun je nog niet uitvoeren. Voor het eerste inlevermoment
        // mag je die overslaan.
        // In een volgende huiswerk opdracht ga je deze tests wel uitwerken.
        // Voor nu:
        done();
    });

    it('TC-201-5 - User succesvol geregistreerd', (done) => {
        // nieuwe user waarmee we testen
        const newUser = {
            "firstName": "Karel",
            "lastName": "Ronaldo",
            "emailAddress": "Karel.R@gmail.com"
        }

        // Voer de test uit
        chai
            .request(server)
            .post('/api/register')
            .send(newUser)
            .end((err, res) => {
                assert(err === null);
                res.body.should.be.an('object');
                let { status, message, data } = res.body;
                status.should.equal(200);
                message.should.be.a('string').that.contains('toegevoegd');
                data.should.be.an('object');
                // OPDRACHT!
                // Bekijk zelf de API reference op https://www.chaijs.com/api/bdd/
                // Daar zie je welke chained functions je nog meer kunt gebruiken.
                data.should.include({ id: 2 });
                data.should.not.include({ id: 0 });
                data.id.should.equal(2);
                data.firstName.should.equal("Karel");
                data.emailAddress.should.equal("Karel.R@gmail.com")
                done();
            });
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
                let { status, message, data } = res.body;
                status.should.equal(200);
                data.should.be.an('array');
                done();
            });
    });

    // Je kunt een test ook tijdelijk skippen om je te focussen op andere testcases.
    // Dan gebruik je it.skip
    it.skip('TC-202-2 - Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
        // Voer de test uit
        chai
            .request(server)
            .get('/api/user')
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

describe('UC-203 opvragen van gebruikersprofiel', () => {
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
            id: 1
        }
        chai
            .request(server)
            .get('/api/user/userid')
            .send(int)
            
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                status.should.equal(200);
                message.should.be.a('string').that.contains('There is');
                data.should.be.an('object');
                data.id.should.equal(1);
                done();
            });
    });
});

describe('UC-205 Gebruikersinformatie wijzingen', () => {
    it.skip('TC-205-1 - Gebruikersinformatie succesvol gewijzigd', (done) => {

        const user = {
            "id": 0,
            "firstName": "Karel",
            "lastName": "Ronaldo",
            "emailAddress": "Karel.R@gmail.com"
        }
        chai
            .request(server)
            .put('/api/user/change')
            .send(user)
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                status.should.equal(200);
                message.should.be.a('string').that.contains('Changed the user');
                data.should.be.an('object');
                data.id.should.equal(0);
                done();
            });
    });
});

describe('UC-206 Verwijder de user met het opgegeven id', () => {
    it.skip('TC-206-1 - User succesvol opgevraagd', (done) => {

        const int = {
            id: 1
        }
        chai
            .request(server)
            .delete('/api/user/delete')
            .send(int)
            
            .end((err, res) => {
                assert(err === null);
                let { status, message, data } = res.body;
                status.should.equal(200);
                message.should.be.a('string').that.contains('There is');
                data.should.be.an('object');
                data.id.should.equal(1);
                done();
            });
    });
});
