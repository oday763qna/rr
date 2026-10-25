import type { Task } from './types';
import { requireSupabase } from './supabase';

type TaskRow = {
  id: string; user_id: string; title: string; description: string; status: Task['status'];
  priority: Task['priority']; due_date: string | null; project_id: string; kind: Task['kind'];
  subtasks: Task['subtasks']; pomodoro_minutes: number; pomodoros_completed: number;
  color: string | null; icon: string | null; related_task_ids: string[]; created_at: string;
  updated_at: string; completed_at: string | null;
};

const toRow = (task: Task, userId: string): TaskRow => ({
  id: task.id, user_id: userId, title: task.title, description: task.description, status: task.status,
  priority: task.priority, due_date: task.dueDate || null, project_id: task.projectId, kind: task.kind,
  subtasks: task.subtasks ?? [], pomodoro_minutes: task.pomodoroMinutes, pomodoros_completed: task.pomodorosCompleted,
  color: task.color ?? null, icon: task.icon ?? null, related_task_ids: task.relatedTaskIds ?? [],
  created_at: new Date(task.createdAt).toISOString(), updated_at: new Date(task.updatedAt).toISOString(),
  completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : null,
});
const fromRow = (row: TaskRow): Task => ({
  id: row.id, ownerUid: row.user_id, title: row.title, description: row.description, status: row.status,
  priority: row.priority, dueDate: row.due_date ?? '', projectId: row.project_id, kind: row.kind,
  subtasks: row.subtasks ?? [], pomodoroMinutes: row.pomodoro_minutes, pomodorosCompleted: row.pomodoros_completed,
  color: row.color ?? undefined, icon: row.icon ?? undefined, relatedTaskIds: row.related_task_ids ?? [],
  createdAt: Date.parse(row.created_at), updatedAt: Date.parse(row.updated_at),
  ...(row.completed_at ? { completedAt: Date.parse(row.completed_at) } : {}),
});

export async function fetchCloudTasks(): Promise<Task[]> {
  const client = requireSupabase();
  const { data, error } = await client.from('tasks').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => fromRow(row as TaskRow));
}
export async function saveCloudTask(task: Task, userId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('tasks').upsert(toRow(task, userId), { onConflict: 'id' });
  if (error) throw error;
}
export async function removeCloudTask(taskId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}
