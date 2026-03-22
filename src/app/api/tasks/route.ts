import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserByEmail, getTasksForUser, saveTasks, addTaskToDb, updateTaskStatus } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ tasks: [] });
  }

  const tasks = await getTasksForUser(user.id);
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await req.json();

  // Save all tasks (bulk)
  if (body.tasks) {
    await saveTasks(user.id, body.tasks);
    return NextResponse.json({ ok: true });
  }

  // Add single task
  if (body.task) {
    const id = await addTaskToDb(user.id, body.task);
    return NextResponse.json({ id });
  }

  // Update task status
  if (body.taskId && body.status) {
    await updateTaskStatus(body.taskId, body.status, body.delegateTo, body.delegationBrief, body.reasoning);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
