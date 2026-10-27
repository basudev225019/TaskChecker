function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function TaskItem({ task, busy, onToggle, onDelete }) {
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < startOfToday();

  return (
    <li className={`task-item${task.completed ? ' is-done' : ''}`}>
      <label className="task-check">
        <input
          type="checkbox"
          checked={task.completed}
          disabled={busy}
          onChange={() => onToggle(task)}
        />
        <span className="task-title">{task.title}</span>
      </label>

      <div className="task-meta">
        {task.dueDate && (
          <span className={`badge${isOverdue ? ' badge-danger' : ''}`}>
            {isOverdue ? 'Overdue · ' : 'Due '}
            {formatDate(task.dueDate)}
          </span>
        )}
        <button
          type="button"
          className="btn btn-danger-ghost"
          disabled={busy}
          onClick={() => onDelete(task)}
          aria-label={`Delete task ${task.title}`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
