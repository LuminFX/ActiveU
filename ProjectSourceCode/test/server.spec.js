// ********************** Initialize server **********************************

const server = require('../index.js'); 

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

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

describe('Testing Redirect', () => {
    // Sample test case given to test /test endpoint.
    it('\test route should redirect to /login with 302 HTTP status code', done => {
      chai
        .request(server)
        .get('/test')
        .end((err, res) => {
          res.should.have.status(302); // Expecting a redirect status code
          res.should.redirectTo(/^.*127\.0\.0\.1.*\/login$/); // Expecting a redirect to /login with the mentioned Regex
          done();
        });
    });
  });

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************