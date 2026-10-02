import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes,scryptSync } from 'node:crypto';
import { configured,verifyCredentials,createSession,validSession,sameOrigin } from '../lib/auth.ts';
test('login memverifikasi password dan sesi bertanda tangan',()=>{
 const salt=randomBytes(16).toString('hex');process.env.KARIER_ADMIN_USER='test-admin';process.env.KARIER_ADMIN_PASSWORD_HASH=salt+':'+scryptSync('test-only-password',salt,64).toString('hex');process.env.KARIER_SESSION_SECRET=randomBytes(32).toString('hex');
 assert.equal(configured(),true);assert.equal(verifyCredentials('test-admin','test-only-password'),true);assert.equal(verifyCredentials('test-admin','wrong'),false);assert.equal(verifyCredentials('other','test-only-password'),false);
 const token=createSession();const req=value=>new Request('https://karier.example/',{headers:{cookie:'karier_session='+value}});
 assert.equal(validSession(req(token)),true);assert.equal(validSession(req(token+'x')),false);assert.equal(validSession(new Request('https://karier.example/')),false);
 process.env.KARIER_SESSION_SECRET=randomBytes(32).toString('hex');assert.equal(validSession(req(token)),false);
 assert.equal(sameOrigin(new Request('https://karier.example/',{headers:{origin:'https://other.example'}})),false);assert.equal(sameOrigin(new Request('https://karier.example/',{headers:{origin:'https://karier.example'}})),true);
 delete process.env.KARIER_SESSION_SECRET;assert.equal(configured(),false);
});
