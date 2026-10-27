import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const fields = [
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
];

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/';

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(values) {
    await login(values);
    navigate(destination, { replace: true });
  }

  return (
    <section className="page-narrow">
      <h1>Log in</h1>
      <AuthForm
        fields={fields}
        submitLabel="Log in"
        onSubmit={handleSubmit}
        footer={<>New here? <Link to="/register">Create an account</Link></>}
      />
    </section>
  );
}
