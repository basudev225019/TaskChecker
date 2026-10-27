import { useState } from 'react';

// Shared form for the login and register pages.
// fields: [{ name, label, type, autoComplete, minLength }]
export default function AuthForm({ fields, submitLabel, onSubmit, footer }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.name, '']))
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form className="card auth-card" onSubmit={handleSubmit} noValidate>
      {fields.map((field) => (
        <div className="field" key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            minLength={field.minLength}
            required
            value={values[field.name]}
            onChange={handleChange}
          />
        </div>
      ))}

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? 'Please wait...' : submitLabel}
      </button>

      <p className="auth-footer">{footer}</p>
    </form>
  );
}
