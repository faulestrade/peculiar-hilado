import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/productos', label: 'Productos', icon: '🧶' },
  { to: '/categorias', label: 'Categorías', icon: '📂' },
  { to: '/stock', label: 'Stock', icon: '📦' },
  { to: '/pedidos', label: 'Pedidos', icon: '🛍️' },
  { to: '/ingresos', label: 'Ingresos', icon: '💰' },
  { to: '/usuarios', label: 'Usuarios', icon: '👤', superadminOnly: true },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img src="/peculiar_hilado_logo.png" alt="Peculiar Hilado" height="52" />
      </div>
      <nav className="sidebar__nav">
        {links.filter(l => !l.superadminOnly || user?.role === 'superadmin').map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer">
        <p>{user?.name}</p>
        <button onClick={signOut}>Cerrar sesión</button>
      </div>
    </aside>
  );
}
