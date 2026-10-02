import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
export const SESSION_COOKIE='karier_session';
const equal=(a:Buffer,b:Buffer)=>a.length===b.length&&timingSafeEqual(a,b);
export function configured(){return Boolean(process.env.KARIER_ADMIN_USER&&process.env.KARIER_ADMIN_PASSWORD_HASH&&process.env.KARIER_SESSION_SECRET&&process.env.KARIER_SESSION_SECRET.length>=32);}
export function verifyCredentials(user:string,password:string){
 if(!configured()||password.length>256)return false;
 const [salt,hash]=process.env.KARIER_ADMIN_PASSWORD_HASH!.split(':');
 try{return equal(Buffer.from(user),Buffer.from(process.env.KARIER_ADMIN_USER!))&&equal(scryptSync(password,salt,64),Buffer.from(hash,'hex'));}catch{return false;}
}
const sign=(value:string)=>createHmac('sha256',process.env.KARIER_SESSION_SECRET!).update(value).digest('base64url');
export function createSession(){const payload=Buffer.from(JSON.stringify({user:process.env.KARIER_ADMIN_USER,expires:Date.now()+8*60*60*1000,nonce:randomBytes(16).toString('hex')})).toString('base64url');return `${payload}.${sign(payload)}`;}
export function validSession(req:Request){
 if(!configured())return false;
 const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(SESSION_COOKIE+'='))?.slice(SESSION_COOKIE.length+1);
 if(!token)return false;
 try{const [payload,signature,...extra]=token.split('.');if(extra.length||!signature||!equal(Buffer.from(signature),Buffer.from(sign(payload))))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return data.user===process.env.KARIER_ADMIN_USER&&Number.isFinite(data.expires)&&data.expires>Date.now();}catch{return false;}
}
export function authorize(req:Request):Response|null {return validSession(req)?null:Response.json({error:'Silakan masuk ke KARIER.'},{status:configured()?401:503,headers:{'Cache-Control':'no-store'}});}
export function sameOrigin(req:Request){try{const origin=new URL(req.headers.get('origin')||''),url=new URL(req.url);return origin.host===(req.headers.get('host')||url.host)&&origin.protocol===url.protocol;}catch{return false;}}
