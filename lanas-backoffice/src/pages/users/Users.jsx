import { useEffect, useState } from 'react';
import { getAdminUsers, createAdminUser, deleteAdminUser, changeAdminPassword } from '../../api';
import { useAuth } from '../../context/AuthContext';
import '../products/Products.css';

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');
  const [changingPwd, setChangingPwd] = useState(null);
  const [newPwd, setNewPwd] = useState('');
  const [pwdError, setPwdError] = useState('');

  const load = () => {
    setLoading(true);
    getAdminUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createAdminUser(form);
      setForm({ name: '', email: '', password: '', role: 'admin' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await deleteAdminUser(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const handleChangePwd = async (id) => {
    setPwdError('');
    try {
      await changeAdminPassword(id, newPwd);
      setChangingPwd(null);
      setNewPwd('');
    } catch (err) {
      setPwdError(err.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  const roleLabel = { admin: 'Admin', superadmin: 'Superadmin' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
      <div>
        <h1 className="page-title">Usuarios</h1>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="table-loading">Cargando...</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    {u.id === me?.id && <span style={{ marginLeft: '0.4rem', fontSize: '0.72rem', color: '#9a7a5a' }}>(vos)</span>}
                  </td>
                  <td style={{ fontSize: '0.875rem', color: '#666' }}>{u.email}</td>
                  <td>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.05em', color: u.role === 'superadmin' ? '#b06040' : '#5a7a5a',
                      background: u.role === 'superadmin' ? '#fdf0e8' : '#f0f5f0',
                      padding: '0.15rem 0.5rem', borderRadius: 4
                    }}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn-edit"
                        onClick={() => { setChangingPwd(u.id); setNewPwd(''); setPwdError(''); }}
                      >
                        Contraseña
                      </button>
                      {u.id !== me?.id && (
                        <button className="btn-delete" onClick={() => handleDelete(u.id)}>Eliminar</button>
                      )}
                    </div>
                    {changingPwd === u.id && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="password"
                          placeholder="Nueva contraseña"
                          value={newPwd}
                          onChange={e => setNewPwd(e.target.value)}
                          style={{ padding: '0.35rem 0.6rem', border: '1px solid #e0d0c0', borderRadius: 6, fontSize: '0.85rem', width: 160 }}
                        />
                        <button
                          className="btn-primary"
                          onClick={() => handleChangePwd(u.id)}
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => { setChangingPwd(null); setPwdError(''); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '0.85rem' }}
                        >
                          ✕
                        </button>
                        {pwdError && <span style={{ color: '#c04040', fontSize: '0.8rem' }}>{pwdError}</span>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="page-title" style={{ fontSize: '1.2rem' }}>Nuevo usuario</h2>
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Nombre *', name: 'name', type: 'text' },
            { label: 'Email *', name: 'email', type: 'email' },
            { label: 'Contraseña *', name: 'password', type: 'password' },
          ].map(f => (
            <label key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 500, color: '#5a4a3a' }}>
              {f.label}
              <input
                type={f.type}
                name={f.name}
                value={form[f.name]}
                onChange={e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                required
                style={{ padding: '0.55rem 0.8rem', border: '1px solid #e0d0c0', borderRadius: 8, fontSize: '0.9rem', outline: 'none' }}
              />
            </label>
          ))}
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 500, color: '#5a4a3a' }}>
            Rol
            <select
              value={form.role}
              onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
              style={{ padding: '0.55rem 0.8rem', border: '1px solid #e0d0c0', borderRadius: 8, fontSize: '0.9rem', outline: 'none', background: '#fff' }}
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </label>
          {error && <p style={{ color: '#c04040', fontSize: '0.85rem' }}>{error}</p>}
          <button type="submit" className="btn-primary">Crear usuario</button>
        </form>
      </div>
    </div>
  );
}
