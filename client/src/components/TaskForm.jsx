import { useState } from 'react';

const MAX_TITLE = 120;

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError('Please enter a task title.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onCreate({ title: trimmed, dueDate });
      setTitle('');
      setDueDate('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form card" onSubmit={handleSubmit} noValidate>
      <h2>Add a task</h2>
      <div className="form-row">
        <div className="field grow">
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            type="text"
            maxLength={MAX_TITLE}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'task-form-error' : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor="task-due">Due date (optional)</label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Add task'}
        </button>
      </div>
      {error && (
        <p id="task-form-error" className="field-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
