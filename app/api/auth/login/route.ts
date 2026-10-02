import { NextResponse } from 'next/server';
import { configured, createSession, sameOrigin, SESSION_COOKIE, verifyCredentials } from '@/lib/auth';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'Asal permintaan tidak sesuai.'},{status:403});
 if(!configured())return NextResponse.json({error:'Login belum dikonfigurasi oleh pengurus.'},{status:503});
 try{const {username,password}=await req.json();if(typeof username!=='string'||typeof password!=='string'||!verifyCredentials(username,password))return NextResponse.json({error:'Username atau password salah.'},{status:401});const response=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});response.cookies.set(SESSION_COOKIE,createSession(),{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'strict',path:'/',maxAge:28800});return response;}catch{return NextResponse.json({error:'Data login tidak valid.'},{status:400});}
}
