import {useEffect,useState} from 'react';
import type {FormEvent} from 'react';
import {Cloud,LogOut} from 'lucide-react';
import {supabase} from './supabase';

export default function CloudPanel({language,guestCount,onMigrate}:{language:'en'|'ar';guestCount:number;onMigrate:()=>Promise<void>}){
 const [user,setUser]=useState<{id:string;email?:string} | null>(null),[mode,setMode]=useState<'login'|'register'>('login'),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[verificationEmail,setVerificationEmail]=useState('');
 const ar=language==='ar';
 useEffect(()=>{
  if(!supabase)return;
  let active=true;
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user?{id:session.user.id,email:session.user.email}:null));
  void supabase.auth.getSession().then(({data})=>{if(active)setUser(data.session?.user?{id:data.session.user.id,email:data.session.user.email}:null);});
  return()=>{active=false;subscription.unsubscribe();};
 },[]);
 const submitEmail=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();if(!supabase)return;
  const form=new FormData(e.currentTarget),email=String(form.get('email')).trim(),password=String(form.get('password'));
  setBusy(true);setMessage('');
  try{
   if(mode==='register'){
    const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${window.location.origin}${import.meta.env.BASE_URL}`}});if(error)throw error;
    if(data.session){setVerificationEmail('');setMessage(ar?'تم إنشاء الحساب وتسجيل الدخول.':'Account created and signed in.');}
    else {setVerificationEmail(email);setMessage(ar?'تم إنشاء الحساب. أكّد بريدك الإلكتروني من رسالة Supabase ثم سجّل الدخول.':'Account created. Confirm your email using the Supabase message, then sign in.');}
   }else{
    const {error}=await supabase.auth.signInWithPassword({email,password});if(error){if(error.code==='email_not_confirmed')setVerificationEmail(email);throw error;}
    setVerificationEmail('');setMessage(ar?'تم تسجيل الدخول بنجاح.':'Signed in successfully.');
   }
  }catch(error){setMessage(authErrorMessage(error,ar));}
  finally{setBusy(false);}
 };
 const resendConfirmation=async()=>{if(!supabase||!verificationEmail)return;setBusy(true);setMessage('');try{const {error}=await supabase.auth.resend({type:'signup',email:verificationEmail,options:{emailRedirectTo:`${window.location.origin}${import.meta.env.BASE_URL}`}});if(error)throw error;setMessage(ar?'أرسلنا رسالة تأكيد جديدة. افحص الوارد والرسائل غير المرغوبة.':'A new confirmation email was sent. Check your inbox and spam folder.');}catch(error){setMessage(authErrorMessage(error,ar));}finally{setBusy(false);}};
 const signInWithGoogle=async()=>{if(!supabase)return;setBusy(true);setMessage('');try{const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}${import.meta.env.BASE_URL}`,queryParams:{prompt:'select_account'}}});if(error)throw error;}catch(error){setBusy(false);setMessage(oauthErrorMessage(error,ar));}};
 const migrate=async()=>{setBusy(true);setMessage('');try{await onMigrate();setMessage(ar?'تم نقل المهام المحلية إلى حسابك.':'Local tasks were linked to your account.');}catch(error){setMessage(error instanceof Error?error.message:(ar?'تعذر نقل المهام.':'Could not link local tasks.'));}finally{setBusy(false);}};
 const signOut=async()=>{if(!supabase)return;setBusy(true);try{const {error}=await supabase.auth.signOut();if(error)throw error;setMessage(ar?'تم تسجيل الخروج.':'Signed out.');}catch(error){setMessage(oauthErrorMessage(error,ar));}finally{setBusy(false);}};
 return <section className="settings-card"><h3><Cloud size={17}/> {ar?'حساب Supabase':'Supabase account'}</h3>
  {!supabase?<p>{ar?'إعدادات Supabase غير موجودة.':'Supabase is not configured.'}</p>:user?<>
   <p>{ar?`مسجل الدخول: ${user.email??user.id}`:`Signed in: ${user.email??user.id}`}</p>
   {guestCount>0&&<button className="secondary" disabled={busy} onClick={()=>void migrate()}>{ar?`نقل ${guestCount} مهمة محلية إلى هذا الحساب`:`Link ${guestCount} local tasks to this account`}</button>}
   <button className="secondary" disabled={busy} onClick={()=>void signOut()}><LogOut size={16}/>{ar?'تسجيل الخروج':'Sign out'}</button>
  </>:<>
   <p>{ar?'سجّل بالبريد وكلمة المرور، أو استخدم Google.':'Sign in with email and password, or continue with Google.'}</p>
   <form className="form-grid" onSubmit={e=>void submitEmail(e)}>
    <label>{ar?'البريد الإلكتروني':'Email'}<input name="email" type="email" autoComplete="email" required/></label>
    <label>{ar?'كلمة المرور':'Password'}<input name="password" type="password" minLength={6} autoComplete={mode==='login'?'current-password':'new-password'} required/></label>
    <button className="primary" disabled={busy}>{busy?(ar?'جارٍ التنفيذ…':'Working…'):mode==='login'?(ar?'تسجيل الدخول بالبريد':'Sign in with email'):(ar?'إنشاء حساب بالبريد':'Create email account')}</button>
   </form>
   <button className="text-button" disabled={busy} onClick={()=>{setMessage('');setMode(mode==='login'?'register':'login');}}>{mode==='login'?(ar?'إنشاء حساب جديد':'Create an account'):(ar?'لدي حساب بالفعل':'I already have an account')}</button>
   <div className="auth-divider"><span>{ar?'أو':'or'}</span></div>
   <button className="secondary google-signin" disabled={busy} onClick={()=>void signInWithGoogle()}>
    <svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.9 6.1-15z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44z"/><path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 18z"/><path fill="#EA4335" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4z"/></svg>
    {busy?(ar?'جارٍ التحويل…':'Connecting…'):(ar?'المتابعة باستخدام Google':'Continue with Google')}
   </button>
   {mode==='register'&&<small className="muted">{ar?'قد يتطلب الحساب الجديد تأكيد البريد الإلكتروني.':'New accounts may need email confirmation.'}</small>}
  </>}
  {message&&<p role="status">{message}</p>}{verificationEmail&&!user&&<button className="text-button" disabled={busy} onClick={()=>void resendConfirmation()}>{ar?'إعادة إرسال رسالة التأكيد':'Resend confirmation email'}</button>}
 </section>;
}

function authErrorMessage(error:unknown,ar:boolean){
 const code=error&&typeof error==='object'&&'code'in error?String((error as {code?:unknown}).code??''):'';
 const message=error instanceof Error?error.message:'';
 if(code==='invalid_credentials')return ar?'البريد الإلكتروني أو كلمة المرور غير صحيحة.':'Email or password is incorrect.';
 if(code==='email_not_confirmed')return ar?'أكّد بريدك الإلكتروني أولاً، ثم سجّل الدخول.':'Confirm your email first, then sign in.';
 if(code==='weak_password')return ar?'كلمة المرور ضعيفة. اختر كلمة مرور أقوى.':'Password is too weak. Choose a stronger password.';
 if(code==='user_already_exists')return ar?'جرّب تسجيل الدخول بهذا البريد أو استخدم بريدًا آخر.':'Try signing in with this email or use another email.';
 if(code==='over_email_send_rate_limit'||/rate limit/i.test(message))return ar?'طلبات البريد كثيرة. انتظر قليلًا ثم حاول مجددًا.':'Too many email requests. Wait a while, then try again.';
 if(/email address not authorized/i.test(message))return ar?'إرسال البريد التجريبي محدود بعناوين فريق Supabase. أضف SMTP مخصصًا لإرسال الرسائل للمستخدمين.':'Supabase test email only allows team addresses. Configure custom SMTP to send to users.';
 if(/redirect.*not allowed|not whitelisted/i.test(message))return ar?'أضف عنوان التطبيق إلى قائمة Redirect URLs في إعدادات Supabase Auth.':'Add this app URL to Supabase Auth Redirect URLs.';
 if(/failed to fetch|network/i.test(message))return ar?'تعذر الاتصال بـ Supabase. تحقق من الإنترنت ورابط المشروع.':'Could not reach Supabase. Check your internet connection and project URL.';
 return message|| (ar?'تعذر إكمال الطلب.':'Could not complete the request.');
}
function oauthErrorMessage(error:unknown,ar:boolean){
 const message=error instanceof Error?error.message:'';
 if(/provider.*not enabled|unsupported provider/i.test(message))return ar?'تسجيل Google غير مفعّل في Supabase Auth بعد.':'Google sign-in is not enabled in Supabase Auth yet.';
 if(/redirect.*not allowed|not whitelisted/i.test(message))return ar?'أضف عنوان التطبيق إلى Redirect URLs في إعدادات Supabase Auth.':'Add this app URL to Supabase Auth Redirect URLs.';
 if(/access_denied|cancel/i.test(message))return ar?'تم إلغاء تسجيل الدخول.':'Sign-in was cancelled.';
 return message|| (ar?'تعذر الاتصال بـ Google. تحقق من إعداد المزوّد وحاول مجددًا.':'Could not connect to Google. Check the provider setup and try again.');
}
