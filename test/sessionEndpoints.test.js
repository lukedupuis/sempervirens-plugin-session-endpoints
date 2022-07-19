import { expect } from 'chai';
import { readFileSync } from 'fs';
import superagent from 'superagent';
import authorizer from '@sempervirens/authorizer';
import Server from '@sempervirens/server';

import { sessionEndpoints } from '../index.js';

const jwtPublicKey = readFileSync('./security/jwt/jwtRS256.key.pub', 'utf8');
const jwtPrivateKey = readFileSync('./security/jwt/jwtRS256.key', 'utf8');

authorizer.init({ jwtPublicKey, jwtPrivateKey });

describe('1. sessionEndpoints', () => {

  describe('1.1. When sessionEndpoints is passed into a SiteLoader config endpoints array', () => {

    new Server({
      port: 8080,
      sites: [
        {
          domain: 'site-1',
          endpoints: [
            ...sessionEndpoints()
          ]
        }
      ]
    }).start({ suppressLog: true });

    describe('1.1.1. When "POST /api/session/start" is called', () => {
      // return;
      it('1.1.1.1. Should ecrypt the data and return a valid token', async () => {
        const { body: { data: { token } } } = await superagent
          .post('http://localhost:8080/site-1/api/session/start')
          .send({ prop1: 'val1' });
        expect(authorizer.isValid(token)).to.be.true;
        const { prop1 } = authorizer.decrypt(token);
        expect(prop1).to.equal('val1');
      });
    });

    describe('1.1.2. When "GET /api/session/validate" is called', () => {
      // return;

      it('1.1.2.1. Should return "isValid" as "true" for a valid token', async () => {
        // return;
        const token = authorizer.encrypt({ expiresIn: '1m', data: { prop1: 'val1' } });
        const { body: { data: { isValid } } } = await superagent
          .get('http://localhost:8080/site-1/api/session/validate')
          .set('Authorization', `Bearer ${token}`);
        expect(isValid).to.be.true;
      });

      it('1.1.2.2. Should return "isValid" as "false" for an invalid token', async () => {
        // return;
        const token = authorizer.encrypt({ expiresIn: '1m', data: { prop1: 'val1' } });
        authorizer.invalidate(token);
        const { body: { data: { isValid } } } = await superagent
          .get('http://localhost:8080/site-1/api/session/validate')
          .set('Authorization', `Bearer ${token}`);
        expect(isValid).to.be.false;
      });

    });

    describe('1.1.3. When "GET /api/session/reset" is called', () => {
      // return;

      it('1.1.3.1. Should return a new token with the same data as the first and "origIat" as the first "iat"', async () => {
        // return;
        const token1 = authorizer.encrypt({ expiresIn: '1m', data: { prop1: 'val1' } });
        const decrypted1 = authorizer.decrypt(token1);
        await new Promise(resolve => setTimeout(() => resolve(), 1200));
        const { body: { data: { token: token2 } } } = await superagent
          .get('http://localhost:8080/site-1/api/session/reset')
          .set('Authorization', `Bearer ${token1}`);
        const decrypted2 = authorizer.decrypt(token2);
        expect(decrypted2.origIat).to.equal(decrypted1.iat);
        expect(decrypted2.iat).to.be.greaterThan(decrypted1.iat);
        expect(decrypted2.prop1).to.equal('val1');
      });

      it('1.1.3.2. Should invalidte the first token', async () => {
        // return;
        const token = authorizer.encrypt({ expiresIn: '1m', data: { prop1: 'val1' } });
        await superagent
          .get('http://localhost:8080/site-1/api/session/reset')
          .set('Authorization', `Bearer ${token}`);
        expect(authorizer.isValid(token)).to.be.false;
      });

    });

    describe('1.1.4. When "GET /api/session/stop" is called', () => {
      // return;
      it('1.1.4.1. Invalidate the token', async () => {
        const token = authorizer.encrypt({ expiresIn: '1m', data: { prop1: 'val1' } });
        await superagent
          .get('http://localhost:8080/site-1/api/session/stop')
          .set('Authorization', `Bearer ${token}`);
        expect(authorizer.isValid(token)).to.be.false;
      });
    });

  });

  after(() => setTimeout(() => process.exit(), 100));

});