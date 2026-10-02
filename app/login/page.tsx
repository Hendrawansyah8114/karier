'use client';
import { useState, type FormEvent } from 'react';
export default function Login(){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const values=new FormData(e.currentTarget);try{const response=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:values.get('username'),password:values.get('password')})});const result=await response.json();if(!response.ok){setError(result.error);return;}window.location.assign('/');}catch{setError('Tidak dapat terhubung. Silakan coba lagi.');}finally{setBusy(false);}}
 return <main className="login-screen"><section className="login-card"><img src="/karier-logo.svg" alt="Logo KARIER" width="76" height="76"/><h1>KARIER</h1><p>Kas Rutin Irene Residence</p><h2>Masuk ke aplikasi</h2><form onSubmit={submit}><label>Username<input name="username" autoComplete="username" required maxLength={100}/></label><label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={256}/></label>{error&&<p role="alert" className="login-error">{error}</p>}<button disabled={busy} type="submit">{busy?'Memeriksa…':'Masuk'}</button></form><small>Akses pengurus untuk pencatatan iuran dan kas RT.</small></section></main>;
}
