import {createClient} from '@supabase/supabase-js';
import process from 'node:process';

type Request={method?:string;headers:Record<string,string|string[]|undefined>;body?:unknown};
type Response={status:(code:number)=>Response;json:(body:unknown)=>void;setHeader:(name:string,value:string)=>void};
const json=(res:Response,status:number,body:unknown)=>{res.setHeader('Cache-Control','no-store');res.status(status).json(body);};

export default async function handler(req:Request,res:Response){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'Method not allowed.'});}
 const authHeader=req.headers.authorization;const bearer=Array.isArray(authHeader)?authHeader[0]:authHeader;
 const token=bearer?.match(/^Bearer\s+(.+)$/i)?.[1];if(!token)return json(res,401,{error:'Sign in again to continue.'});
 const body=typeof req.body==='string'?(()=>{try{return JSON.parse(req.body as string)}catch{return null}})():req.body;
 if(!body||typeof body!=='object'||Array.isArray(body))return json(res,400,{error:'Invalid request.'});
 const {confirmationEmail,confirmationText}=body as {confirmationEmail?:unknown;confirmationText?:unknown};
 if(typeof confirmationEmail!=='string'||confirmationText!=='DELETE')return json(res,400,{error:'Please confirm the account email and deletion.'});
 const url=process.env.VITE_SUPABASE_URL;const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;const adminKey=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key||!adminKey)return json(res,503,{error:'Account deletion is not configured on the server.'});
 const authClient=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const {data:{user},error:userError}=await authClient.auth.getUser(token);if(userError||!user?.email)return json(res,401,{error:'Your session is invalid. Sign in again.'});
 if(user.email.toLowerCase()!==confirmationEmail.trim().toLowerCase())return json(res,400,{error:'The confirmation email does not match this account.'});
 const {data:claimsData,error:claimsError}=await authClient.auth.getClaims(token);const authTime=Number(claimsData?.claims?.auth_time);
 if(claimsError||!Number.isFinite(authTime)||Date.now()/1000-authTime>600||authTime>Date.now()/1000+60)return json(res,401,{error:'Please sign in again, then retry the deletion.'});
 const admin=createClient(url,adminKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const {error}=await admin.auth.admin.deleteUser(user.id,false);if(error)return json(res,500,{error:'Account deletion failed. Please try again later.'});
 return json(res,200,{success:true});
}
