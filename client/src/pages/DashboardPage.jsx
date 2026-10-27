import { useCallback, useEffect, useState } from 'react';
import TaskForm from '../components/TaskForm.jsx';
import TaskItem from '../components/TaskItem.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { taskService } from '../services/taskService.js';

export default function DashboardPage() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyIds, setBusyIds] = useState(() => new Set());

  const loadTasks = useCallback(async () => {
    setStatus('loading');
    setLoadError('');
    try {
      const data = await taskService.list();
      setTasks(data.items);
      setStatus('success');
    } catch (err) {
      // An expired or invalid token means the user has to log in again
      if (err.status === 401) {
        logout();
        return;
      }
      setLoadError(err.message);
      setStatus('error');
    }
  }, [logout]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function setBusy(id, isBusy) {
    setBusyIds((current) => {
      const next = new Set(current);
      if (isBusy) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleCreate(payload) {
    const task = await taskService.create(payload);
    setTasks((current) => [task, ...current]);
  }

  async function handleToggle(task) {
    setActionError('');
    setBusy(task._id, true);
    try {
      const updated = await taskService.update(task._id, { completed: !task.completed });
      setTasks((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(task._id, false);
    }
  }

  async function handleDelete(task) {
    setActionError('');
    setBusy(task._id, true);
    try {
      await taskService.remove(task._id);
      setTasks((current) => current.filter((item) => item._id !== task._id));
    } catch (err) {
      setActionError(err.message);
      setBusy(task._id, false);
    }
  }

  const remaining = tasks.filter((task) => !task.completed).length;

  return (
    <section className="dashboard">
      <div className="page-heading">
        <h1>My tasks</h1>
        {status === 'success' && tasks.length > 0 && (
          <p className="muted">{remaining} of {tasks.length} still to do</p>
        )}
      </div>

      <TaskForm onCreate={handleCreate} />

      {actionError && (
        <p className="banner banner-error" role="alert">{actionError}</p>
      )}

      <div className="card">
        {status === 'loading' && <p className="muted" role="status">Loading your tasks...</p>}

        {status === 'error' && (
          <div className="state-block" role="alert">
            <p>We could not load your tasks. {loadError}</p>
            <button type="button" className="btn btn-primary" onClick={loadTasks}>
              Try again
            </button>
          </div>
        )}

        {status === 'success' && tasks.length === 0 && (
          <div className="state-block">
            <p>No tasks yet. Add your first one above to get started.</p>
          </div>
        )}

        {status === 'success' && tasks.length > 0 && (
          <ul className="task-list">
            {tasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                busy={busyIds.has(task._id)}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
