import { createHash, timingSafeEqual } from 'node:crypto';
const equal=(a:string,b:string)=>timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest());
export function authorize(req:Request):Response|null {
 const user=process.env.KARIER_ADMIN_USER,password=process.env.KARIER_ADMIN_PASSWORD;
 if(!user||!password||password.length<16)return new Response('Login pengurus belum dikonfigurasi. Isi variabel login dan gunakan kata sandi minimal 16 karakter.',{status:503});
 let valid=false;const auth=req.headers.get('authorization');
 if(auth?.startsWith('Basic ')){try{const decoded=Buffer.from(auth.slice(6),'base64').toString('utf8'),at=decoded.indexOf(':');valid=at>=0&&equal(decoded.slice(0,at),user)&&equal(decoded.slice(at+1),password)}catch{}}
 return valid?null:new Response('Masuk menggunakan akun pengurus KARIER.',{status:401,headers:{'WWW-Authenticate':'Basic realm="KARIER", charset="UTF-8"','Cache-Control':'no-store'}});
}
