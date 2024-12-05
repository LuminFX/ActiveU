// ********************** Initialize server **********************************

const server = require('../index.js');

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// ********************** PART B TEST CASES ****************************

describe('Testing Registering', () => {

  // verify whether its getting properly inserted into the users table. 
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({ username: 'regTestUser', password: 'testpassword', email: 'myemail@gmail.com' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.should.redirectTo(/^.*127\.0\.0\.1.*\/login$/)
        done();
      });
  });

  // testing whether your API recongizes incorrect POSTs and responds with the appropriate error message.
  it('Negative : /register. Checking invalid password', done => {
    chai
      .request(server)
      .post('/register')
      .send({ username: 'regTestUser', password: 'a', email: '20' }) // Use a valid email format
      .end((err, res) => {
        //expect(res).to.have.status(400);
        expect(res.redirects[0]).to.include('/register');
        done();
      });
  });
});

describe('Testing Login', () => {

  // verify whether its getting properly inserted into the users table. 
  it('positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({ usernameOrEmail: 'regTestUser', password: 'testpassword' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.should.redirectTo(/^.*127\.0\.0\.1.*\/home$/)
        done();
      });
  });

  // testing whether your API recongizes incorrect POSTs and responds with the appropriate error message.
  it('Negative : /login.', done => {
    chai
      .request(server)
      .post('/login')
      .send({ usernameOrEmail: 'regTestUser', password: 'wrongPassword' })
      .end((err, res) => {
        //expect(res).to.have.status(400);
        expect(res.redirects[0]).to.include('/login');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************