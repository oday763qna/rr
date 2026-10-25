import {useEffect,useState} from 'react';
import {AlertTriangle,Trash2,X} from 'lucide-react';

export function ConfirmDialog({language,item,onCancel,onConfirm}:{language:'en'|'ar';item:string;onCancel:()=>void;onConfirm:()=>Promise<void>}){
 const [busy,setBusy]=useState(false);const ar=language==='ar';
 useEffect(()=>{const handler=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!busy)onCancel()};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler)},[busy,onCancel]);
 const confirm=async()=>{setBusy(true);try{await onConfirm()}finally{setBusy(false)}};
 return <div className="overlay confirm-overlay" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)onCancel()}}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"><button className="confirm-close icon-btn" aria-label={ar?'إغلاق':'Close'} onClick={onCancel} disabled={busy}><X size={18}/></button><span className="confirm-icon"><AlertTriangle size={24}/></span><h2 id="delete-title">{ar?'هل تريد حذف هذه المهمة؟':'Delete this task?'}</h2><p id="delete-description">{ar?`سيتم حذف «${item}» نهائيًا. لا يمكن التراجع عن هذا الإجراء.`:`“${item}” will be permanently deleted. This action cannot be undone.`}</p><div className="confirm-actions"><button className="secondary" onClick={onCancel} disabled={busy}>{ar?'إلغاء':'Keep task'}</button><button className="danger-button" onClick={()=>void confirm()} disabled={busy}><Trash2 size={16}/>{busy?(ar?'جارٍ الحذف…':'Deleting…'):(ar?'حذف المهمة':'Delete task')}</button></div></section></div>;
}
