import { NextResponse } from 'next/server';
import { sameOrigin, SESSION_COOKIE } from '@/lib/auth';
export async function POST(req:Request){if(!sameOrigin(req))return NextResponse.json({error:'Asal permintaan tidak sesuai.'},{status:403});const response=NextResponse.json({ok:true});response.cookies.set(SESSION_COOKIE,'',{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'strict',path:'/',maxAge:0});return response;}
