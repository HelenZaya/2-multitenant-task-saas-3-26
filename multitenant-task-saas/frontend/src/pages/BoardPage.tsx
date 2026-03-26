import { useEffect, useMemo, useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import { useAppStore } from '../context/store';
import { BoardData, Column, Task } from '../types';
import { useParams } from 'react-router-dom';

function TaskCard({ task, onComment }: { task: Task; onComment: (taskId: string, content: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const [comment, setComment] = useState('');
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded-xl border border-line bg-zinc-950 p-3 space-y-2">
      <div className="flex items-center justify-between"><div className="font-medium">{task.title}</div><span className="text-xs rounded-full border border-line px-2 py-1">{task.priority}</span></div>
      <div className="subtle text-sm">{task.description}</div>
      <div className="flex flex-wrap gap-2">{task.labels.map((label) => <span key={label} className="rounded-full bg-sky-500/15 px-2 py-1 text-xs text-sky-300">{label}</span>)}</div>
      <div className="text-xs subtle">Assignee: {task.assignee?.name || 'Unassigned'}</div>
      <div className="text-xs subtle">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</div>
      <div className="space-y-2 border-t border-line pt-2">
        <div className="text-xs font-semibold">Comments</div>
        <div className="max-h-24 space-y-2 overflow-auto">{task.comments.map((c) => <div key={c.id} className="rounded-lg bg-panel px-2 py-1 text-xs"><b>{c.user.name}</b>: {c.content}</div>)}</div>
        <div className="flex gap-2"><input className="input !py-1 text-xs" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add comment" /><button className="rounded-lg bg-accent px-2 text-xs font-semibold text-black" onClick={() => { if (comment.trim()) { onComment(task.id, comment); setComment(''); }}}>Send</button></div>
      </div>
    </div>
  );
}

function ColumnView({ column, tasks, onComment }: { column: Column; tasks: Task[]; onComment: (taskId: string, content: string) => void }) {
  return (
    <div className="card min-h-[32rem]">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{column.name}</h2><span className="subtle text-xs">{tasks.length}</span></div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">{tasks.map((task) => <TaskCard key={task.id} task={task} onComment={onComment} />)}</div>
      </SortableContext>
    </div>
  );
}

export function BoardPage() {
  const { boardId = '' } = useParams();
  const board = useAppStore((s) => s.board);
  const setBoard = useAppStore((s) => s.setBoard);
  const auth = useAppStore((s) => s.auth);
  const sensors = useSensors(useSensor(PointerSensor));
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  useEffect(() => {
    api.get<BoardData>(`/tasks/boards/${boardId}`).then((res) => setBoard(res.data));
  }, [boardId, setBoard]);

  useEffect(() => {
    if (!auth?.user.tenantId && !localStorage.getItem('accessToken')) return;
    socket.connect();
    const tenantId = auth?.user.tenantId || JSON.parse(atob(localStorage.getItem('accessToken')!.split('.')[1])).tenantId;
    socket.emit('tenant.join', tenantId);
    const refresh = () => api.get<BoardData>(`/tasks/boards/${boardId}`).then((res) => setBoard(res.data));
    ['task.created', 'task.updated', 'task.moved', 'comment.added'].forEach((event) => socket.on(event, refresh));
    return () => { ['task.created', 'task.updated', 'task.moved', 'comment.added'].forEach((event) => socket.off(event, refresh)); socket.disconnect(); };
  }, [auth?.user.tenantId, boardId, setBoard]);

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    board?.columns.forEach((c) => { map[c.id] = []; });
    board?.tasks.forEach((task) => { (map[task.columnId] ||= []).push(task); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.position - b.position));
    return map;
  }, [board]);

  async function addTask() {
    if (!board || !newTask.title) return;
    await api.post('/tasks', { boardId: board.id, projectId: board.project.id, columnId: board.columns[0].id, title: newTask.title, description: newTask.description, labels: ['new'] });
    setNewTask({ title: '', description: '' });
    const res = await api.get<BoardData>(`/tasks/boards/${boardId}`);
    setBoard(res.data);
  }

  async function onComment(taskId: string, content: string) {
    await api.post(`/tasks/${taskId}/comments`, { content });
  }

  async function onDragEnd(event: DragEndEvent) {
    if (!board || !event.over || event.active.id === event.over.id) return;
    const taskId = String(event.active.id);
    const overId = String(event.over.id);
    const targetTask = board.tasks.find((t) => t.id === overId);
    const activeTask = board.tasks.find((t) => t.id === taskId);
    if (!activeTask || !targetTask) return;
    await api.post(`/tasks/${taskId}/move`, {
      toColumnId: targetTask.columnId,
      prevPosition: targetTask.position,
      nextPosition: null
    });
  }

  if (!board) return <Layout><div className="card">Loading board...</div></Layout>;

  return (
    <Layout>
      <div className="mb-6 grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="card"><h1 className="text-2xl font-bold">{board.project.name}</h1><p className="subtle">{board.project.description}</p></div>
        <div className="card space-y-2"><input className="input" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} /><input className="input" placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} /><button className="btn w-full" onClick={addTask}>Add task</button></div>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3">{board.columns.map((column) => <ColumnView key={column.id} column={column} tasks={tasksByColumn[column.id] || []} onComment={onComment} />)}</div>
      </DndContext>
    </Layout>
  );
}
