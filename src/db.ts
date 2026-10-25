import Dexie,{type Table} from 'dexie';
import type {FocusSession,Habit,HabitLog,Note,Project,Settings,Task} from './types';
class ODDatabase extends Dexie {
 tasks!:Table<Task,string>; notes!:Table<Note,string>; projects!:Table<Project,string>; habits!:Table<Habit,string>; habitLogs!:Table<HabitLog,string>; sessions!:Table<FocusSession,string>; settings!:Table<Settings,string>;
 constructor(){super('od-tasks');this.version(1).stores({tasks:'id,status,dueDate,projectId,kind,updatedAt',notes:'id,updatedAt',projects:'id,createdAt',habits:'id,createdAt',habitLogs:'id,habitId,date,[habitId+date]',sessions:'id,date',settings:'id'});}
}
export const db=new ODDatabase();
export const defaults:Settings={id:'main',name:'',language:'en',theme:'light',onboarded:false,focusMinutes:25,shortBreak:5,longBreak:15,notifications:false};
export const uid=()=>crypto.randomUUID();
export async function getSettings(){return (await db.settings.get('main'))??defaults;}
