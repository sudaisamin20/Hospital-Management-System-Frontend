import { Link } from 'react-router-dom';
import { useLogin } from '../../features/auth/auth.hooks';
import type { Role } from '../../features/auth/authTypes';

interface LoginFormProps {
  role: Role;
}

// Per-role display configuration — title, ID field placeholder, footer note
const FORM_CONFIG: Record<Role, { title: string; idPlaceholder: string; footerNote: string; showSignupLink: boolean }> = {
  patient:      { title: 'Patient Login',       idPlaceholder: 'Patient ID',      footerNote: '',                              showSignupLink: true  },
  doctor:       { title: 'Doctor Login',        idPlaceholder: 'Doctor ID',       footerNote: 'Account created by hospital admin', showSignupLink: false },
  receptionist: { title: 'Receptionist Login',  idPlaceholder: 'Staff ID',        footerNote: 'Access provided by admin only', showSignupLink: false },
  pharmacist:   { title: 'Pharmacist Login',    idPlaceholder: 'Pharmacist ID',   footerNote: 'Account created by hospital admin', showSignupLink: false },
  labAssistant: { title: 'Lab Assistant Login', idPlaceholder: 'Staff ID',        footerNote: 'Account created by hospital admin', showSignupLink: false },
  superadmin:   { title: 'Super Admin Login',   idPlaceholder: 'Admin ID',        footerNote: 'Account created by developers', showSignupLink: false },
};

const INPUT_CLASS =
  'w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

export function LoginForm({ role }: LoginFormProps) {
  const { formData, handleChange, handleSubmit, isLoading } = useLogin(role);
  const config = FORM_CONFIG[role];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-blue-600">{config.title}</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="id_no"
          type="text"
          value={formData.id_no}
          onChange={handleChange}
          className={INPUT_CLASS}
          placeholder={config.idPlaceholder}
          required
        />

        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={INPUT_CLASS}
          placeholder="Email"
          required
        />

        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={INPUT_CLASS}
          placeholder="Password"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary mt-4 w-full cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {config.showSignupLink && (
          <p className="text-xs text-center mt-3 text-gray-500">
            New patient?{' '}
            <Link to="/signup" className="text-blue-600 cursor-pointer">
              Register here
            </Link>
          </p>
        )}

        {config.footerNote && (
          <p className="text-xs text-gray-500 mt-3 text-center">{config.footerNote}</p>
        )}
      </form>
    </div>
  );
}
