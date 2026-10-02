import { AsyncLocalStorage } from 'node:async_hooks';
import pg, { type PoolClient, type QueryResultRow } from 'pg';
const { Pool } = pg;
const context = new AsyncLocalStorage<PoolClient>();
const globalDB = globalThis as unknown as { karierPool?: pg.Pool };
function pool() {
 if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL belum dikonfigurasi');
 return globalDB.karierPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
}
function statement(sql:string) {let i=0;return sql.replace(/\?/g,()=>`$${++i}`)}
export type Database={prepare:(sql:string)=>Prepared};
class Prepared {
 constructor(private sql:string, private values:unknown[]=[]) {}
 bind(...values:unknown[]) {return new Prepared(this.sql,values)}
 private async query<T extends QueryResultRow>(){return (context.getStore()??pool()).query<T>(statement(this.sql),this.values)}
 async first<T extends QueryResultRow=QueryResultRow>(){return (await this.query<T>()).rows[0]??null}
 async all<T extends QueryResultRow=QueryResultRow>(){return {results:(await this.query<T>()).rows}}
 async run(){await this.query()}
}
export function getDB():Database{return {prepare:sql=>new Prepared(sql)}}
export async function withTransaction(action:()=>Promise<Response>) {
 const client=await pool().connect();
 try {
  await client.query('BEGIN');
  await client.query('SET LOCAL statement_timeout = 15000');
  await client.query('SELECT pg_advisory_xact_lock(20261002,5000)');
  const response=await context.run(client,action);
  await client.query(response.ok?'COMMIT':'ROLLBACK');return response;
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
}
