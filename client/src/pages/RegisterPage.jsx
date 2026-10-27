import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const fields = [
  { name: 'name', label: 'Name', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Password (at least 8 characters)', type: 'password', autoComplete: 'new-password', minLength: 8 },
];

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(values) {
    await register(values);
    navigate('/', { replace: true });
  }

  return (
    <section className="page-narrow">
      <h1>Create your account</h1>
      <AuthForm
        fields={fields}
        submitLabel="Sign up"
        onSubmit={handleSubmit}
        footer={<>Already have an account? <Link to="/login">Log in</Link></>}
      />
    </section>
  );
}
