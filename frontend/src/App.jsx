import { useState, useEffect } from 'react'
import './index.css'

const API_BASE = 'http://localhost:5000';

const templates = [
  { id: 'microservice', label: 'Microservice', name: 'User Auth Service', version: 'v1.0.0', status: 'online', initialLog: 'Initializing authentication database...' },
  { id: 'db', label: 'Database Node', name: 'Redis Cache Cluster', version: 'v6.2.14', status: 'online', initialLog: 'Connected to primary node.' },
  { id: 'worker', label: 'Background Worker', name: 'PDF Queue Processor', version: 'v0.5.2', status: 'offline', initialLog: 'Worker thread suspended due to resource limits.' },
  { id: 'gateway', label: 'Gateway API', name: 'Edge Gateway Proxy', version: 'v2.4.0', status: 'online', initialLog: 'TLS certificates validated successfully.' }
];

// ─── Login / Register Page Component ──────────────
function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'operator' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password, role: formData.role };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('deployease_token', data.token);
        localStorage.setItem('deployease_user', JSON.stringify(data.user));
        setMessage({ type: 'success', text: mode === 'login' ? 'Login successful!' : 'Account created successfully!' });
        setTimeout(() => onAuthSuccess(data.token, data.user), 600);
      } else {
        setMessage({ type: 'error', text: data.message || 'Something went wrong.' });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setMessage({ type: 'error', text: 'Network error. Make sure the backend server is running.' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessage({ type: '', text: '' });
    setFormData({ name: '', email: '', password: '', role: 'operator' });
  };

  return (
    <div className="auth-page" id="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z" fill="#6366f1"/>
          </svg>
          <h1>DeployEase</h1>
          <p>{mode === 'login' ? 'Sign in to your dashboard' : 'Create your account'}</p>
        </div>

        {/* Toggle */}
        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                name="name"
                type="text"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-role">Role</label>
              <select
                id="auth-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="operator">Operator (Deployer)</option>
                <option value="admin">Admin (Full Access)</option>
                <option value="guest">Guest (Read-only)</option>
              </select>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading && <span className="spinner"></span>}
            {loading
              ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
              : (mode === 'login' ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <div className="auth-footer">
          © 2026 DeployEase · Open Source Automation Server
        </div>
      </div>
    </div>
  );
}


// ─── Main App Component ───────────────────────────
function App() {
  // Auth state
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('deployease_token'));
  const [currentUser, setCurrentUser] = useState(() => {
    const u = localStorage.getItem('deployease_user');
    return u ? JSON.parse(u) : null;
  });
  const isAuthenticated = !!(authToken && currentUser);

  const [deployments, setDeployments] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString())
  const [activeTab, setActiveTab] = useState('services')
  const [activeSidebar, setActiveSidebar] = useState('dashboard')
  const [toasts, setToasts] = useState([])

  // New Item states
  const [formData, setFormData] = useState({ name: '', version: 'v1.0.0', status: 'online', initialLog: '' })
  const [formErrors, setFormErrors] = useState({})
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // People states (now from MongoDB)
  const [teamMembers, setTeamMembers] = useState([])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('guest')

  // Helper: auth headers for fetch
  const authHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
    'x-user-role': currentUser?.role || 'guest',
    ...extra
  });

  // Auth handlers
  const handleAuthSuccess = (token, user) => {
    setAuthToken(token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('deployease_token');
    localStorage.removeItem('deployease_user');
    setAuthToken(null);
    setCurrentUser(null);
    setDeployments([]);
    setTeamMembers([]);
  };

  // ─── People / Team Handlers ───────────────────
  const fetchTeamMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/team`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data);
      }
    } catch (err) {
      console.error('Fetch team error:', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      showToast('Name and Email are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/team`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: newMemberName, email: newMemberEmail, role: newMemberRole })
      });

      if (res.ok) {
        const member = await res.json();
        setTeamMembers(prev => [member, ...prev]);
        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberRole('guest');
        showToast(`Invited ${member.name} as ${member.role}!`);
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to add member.');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error adding member.');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/api/team/${memberId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setTeamMembers(prev => prev.map(m =>
          m._id === memberId ? { ...m, role: newRole } : m
        ));
        showToast('Role updated successfully.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating role.');
    }
  };

  const handleGenerateInviteLink = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      showToast('Please enter Name and Email to generate an invite link.');
      return;
    }
    const params = new URLSearchParams();
    params.set('invite', 'true');
    params.set('name', newMemberName.trim());
    params.set('email', newMemberEmail.trim());
    params.set('role', newMemberRole);

    const inviteUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${params.toString()}`;

    navigator.clipboard.writeText(inviteUrl)
      .then(() => showToast('Invite link copied to clipboard!'))
      .catch(() => showToast('Failed to copy. Invite URL: ' + inviteUrl));
  };

  // ─── Form Handlers ────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (tpl) => {
    setFormData({
      name: tpl.name,
      version: tpl.version,
      status: tpl.status,
      initialLog: tpl.initialLog
    });
    setFormErrors({});
    setSelectedTemplate(tpl.id);
  };

  const resetForm = () => {
    setFormData({ name: '', version: 'v1.0.0', status: 'online', initialLog: '' });
    setFormErrors({});
    setSelectedTemplate(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Service name is required' });
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/deployments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast(`Successfully created ${formData.name}!`);
        resetForm();
        await fetchData();
        setActiveSidebar('dashboard');
        setActiveTab('services');
      } else {
        const errorData = await res.json().catch(() => null);
        showToast(errorData?.message || 'Failed to create service. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error: Could not connect to API server.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // ─── Data Fetching ────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchTeamMembers();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [deployRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/api/deployments`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/health`)
      ]).catch(() => [null, null]);

      if (deployRes && deployRes.ok) {
        const data = await deployRes.json();
        const enrichedData = data.map(d => ({
          ...d,
          id: d._id, // Use MongoDB _id
          buildHistory: Array.from({length: 5}, () => Math.random() > 0.2 ? 'success' : 'fail')
        }));
        setDeployments(enrichedData);
      } else if (deployRes && deployRes.status === 401) {
        handleLogout();
        return;
      }
      if (healthRes && healthRes.ok) {
        setHealth(await healthRes.json());
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDeploy = async (id, name) => {
    showToast(`Deployment initiated for ${name}`);

    setDeployments(prev => prev.map(d => {
      if (d.id === id) {
        const newHistory = [...d.buildHistory];
        newHistory.shift();
        newHistory.push('building');
        return { ...d, status: 'deploying', buildHistory: newHistory };
      }
      return d;
    }));

    try {
      const res = await fetch(`${API_BASE}/api/deploy/${id}`, {
        method: 'POST',
        headers: authHeaders()
      });

      if (res.status === 403) {
        showToast("Error: Forbidden. Guests cannot trigger deployments.");
        await fetchData();
      } else if (res.status === 401) {
        handleLogout();
      } else if (!res.ok) {
        showToast("Deploy failed. Server returned an error.");
        await fetchData();
      } else {
        setTimeout(fetchData, 5000);
      }
    } catch (error) {
      console.error("Deploy failed:", error);
      showToast("Network error. Could not contact API server.");
    }
  };

  const getHealthIcon = (history) => {
    if (!history) return '☀️';
    const failures = history.filter(h => h === 'fail').length;
    if (failures === 0) return '☀️';
    if (failures <= 2) return '⛅';
    return '🌧️';
  };

  const filteredDeployments = deployments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Metrics Logic
  const totalDeployments = deployments.length;
  const activeDeployments = deployments.filter(d => d.status === 'online').length;
  const systemHealthScore = totalDeployments > 0 ? Math.round((activeDeployments / totalDeployments) * 100) : 100;

  // ─── If not authenticated, show Login page ────
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // ─── Render Helpers ────────────────────────────
  const renderMetricsBanner = () => (
    <div className="metrics-banner">
      <div className="metric-card">
        <div className="metric-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        </div>
        <div className="metric-info">
          <h4>Total Services</h4>
          <p>{totalDeployments}</p>
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-icon" style={{color: 'var(--success)', background: 'rgba(16,185,129,0.12)'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>
        <div className="metric-info">
          <h4>Health Score</h4>
          <p>{systemHealthScore}%</p>
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-icon" style={{color: 'var(--danger)', background: 'rgba(244,63,94,0.12)'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
        </div>
        <div className="metric-info">
          <h4>Recent Failures</h4>
          <p>{deployments.reduce((acc, curr) => acc + (curr.buildHistory?.filter(h => h === 'fail').length || 0), 0)}</p>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <>
      {renderMetricsBanner()}
      <div className="dashboard">
        {filteredDeployments.length > 0 ? filteredDeployments.map(item => (
          <div key={item.id} className="card">
            <div className="card-header">
              <div>
                <h3>{item.name}</h3>
                <p>Version: {item.version}</p>
              </div>
              <div className="weather-icon" title="Project Health">
                {getHealthIcon(item.buildHistory)}
              </div>
            </div>

            <span className={`status-badge status-${item.status}`}>
              {item.status}
            </span>

            <div className="build-trend">
              Trend:
              <div className="trend-dots">
                {item.buildHistory?.map((status, i) => (
                  <div key={i} className={`trend-dot ${status}`} title={status}></div>
                ))}
              </div>
            </div>

            <div className="logs-container">
              {item.logs?.slice(-3).map((log, i) => (
                <div key={i} className="log-entry">{log}</div>
              ))}
              {(!item.logs || item.logs.length === 0) && (
                <div className="log-entry" style={{color: '#999', borderLeftColor: '#ccc'}}>No logs available</div>
              )}
            </div>

            <div className="meta">
              <button className="primary-btn" onClick={() => handleDeploy(item.id, item.name)} disabled={item.status === 'deploying'}>
                {item.status === 'deploying' ? 'Building...' : 'Build Now'}
              </button>
            </div>
          </div>
        )) : (
          <p style={{color: '#666'}}>No deployments found matching "{searchQuery}".</p>
        )}
      </div>
    </>
  );

  const renderHealth = () => (
    <div className="health-grid">
      <div className="card">
        <h3>System Information</h3>
        {health ? (
          <div className="health-stats" style={{marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <p><strong>Environment:</strong> {health.env}</p>
            <p><strong>Uptime:</strong> {Math.floor(health.uptime)}s</p>
            <p><strong>Memory:</strong> {(health.memory / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : <p style={{marginTop: '1rem', color: '#666'}}>Loading metrics...</p>}
      </div>

      <div className="card" style={{gridColumn: '1 / -1'}}>
        <h3>Active Node Map</h3>
        <p style={{color: '#666', fontSize: '0.875rem', marginTop: '0.25rem'}}>Real-time visualization of your infrastructure routing.</p>

        <div className="node-map">
          <div className="node">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--primary-blue)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            <span className="node-label">Load Balancer</span>
          </div>

          <div className="connection-line"></div>

          <div className="node">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--primary-blue)"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>
            <span className="node-label">Frontend (Vite)</span>
          </div>

          <div className="connection-line"></div>

          <div className="node">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--primary-blue)"><path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H6c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1zm0-5H6c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1zm9 5h-7c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h7c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1zm0-5h-7c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h7c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1z"/></svg>
            <span className="node-label">Backend API</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewItem = () => {
    const statusClass = `status-badge status-${formData.status}`;
    const previewHistory = formData.status === 'offline' ? ['fail', 'success', 'success'] : ['success', 'success', 'success'];
    const weatherIcon = getHealthIcon(previewHistory);

    return (
      <div className="new-item-container">
        <p style={{color: '#666', fontSize: '0.9rem', marginTop: 0, marginBottom: '1.5rem'}}>
          Create a new deployment target or microservice. Fill out the details manually or select a template to populate standard configurations instantly.
        </p>

        <div className="new-item-split">
          <form className="form-panel" onSubmit={handleFormSubmit}>
            <h3>Service Configuration</h3>

            <div className="templates-section">
              <span className="form-label">Quick Templates</span>
              <div className="templates-grid">
                {templates.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    className={`template-btn ${selectedTemplate === tpl.id ? 'active' : ''}`}
                    onClick={() => handleTemplateSelect(tpl)}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="name">Service Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g., Analytics Engine"
                value={formData.name}
                onChange={handleFormChange}
              />
              {formErrors.name && <div className="validation-error">{formErrors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="version">Initial Version</label>
              <input
                id="version"
                name="version"
                type="text"
                className="form-input"
                placeholder="e.g., v1.0.0"
                value={formData.version}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="status">Initial Status</label>
              <select
                id="status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="initialLog">Initial System Log</label>
              <textarea
                id="initialLog"
                name="initialLog"
                className="form-textarea"
                placeholder="Type initial boot logs or system notices here..."
                value={formData.initialLog}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={formSubmitting}>
                Reset
              </button>
              <button type="submit" className="primary-btn" disabled={formSubmitting}>
                {formSubmitting ? 'Registering...' : 'Register Service'}
              </button>
            </div>
          </form>

          <div className="preview-pane">
            <span className="preview-title">Live Service Card Preview</span>
            <div className="card" style={{borderStyle: 'dashed', borderWidth: '2px'}}>
              <div className="card-header">
                <div>
                  <h3>{formData.name || 'Untitled Service'}</h3>
                  <p>Version: {formData.version || 'v1.0.0'}</p>
                </div>
                <div className="weather-icon" title="Project Health">
                  {weatherIcon}
                </div>
              </div>

              <span className={statusClass}>
                {formData.status}
              </span>

              <div className="build-trend">
                Trend:
                <div className="trend-dots">
                  {previewHistory.map((status, i) => (
                    <div key={i} className={`trend-dot ${status}`} title={status}></div>
                  ))}
                  <div className="trend-dot success" title="success"></div>
                  <div className="trend-dot success" title="success"></div>
                </div>
              </div>

              <div className="logs-container">
                <div className="log-entry">{`[${new Date().toLocaleTimeString()}] Service created.`}</div>
                {formData.initialLog && (
                  <div className="log-entry" style={{wordBreak: 'break-all'}}>{`[Initial Log] ${formData.initialLog}`}</div>
                )}
              </div>

              <div className="meta">
                <button className="primary-btn" disabled style={{opacity: 0.6}}>
                  Build Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIdentityBanner = () => {
    const initials = currentUser?.name
      ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';

    return (
      <div className="identity-simulator-banner">
        <div className="identity-info">
          <div className="identity-avatar">
            {initials}
          </div>
          <div className="identity-text">
            Logged in as: <strong>{currentUser?.name}</strong> · <span className="identity-status-badge">{currentUser?.role}</span>
          </div>
        </div>
        <div style={{fontSize: '0.75rem', opacity: 0.8, cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setActiveSidebar('people')}>
          Manage Team
        </div>
      </div>
    );
  };

  const renderPeople = () => {
    return (
      <div className="people-container">
        <p style={{color: '#666', fontSize: '0.9rem', marginTop: 0, marginBottom: '1.5rem'}}>
          Configure role memberships and manage team access. All members are saved to MongoDB.
        </p>

        <div className="people-split">
          <div className="member-list">
            <h3>Team Directory</h3>
            {teamMembers.length === 0 ? (
              <div style={{textAlign: 'center', padding: '2.5rem 1rem', color: '#999', background: 'rgba(15,23,42,0.5)', borderRadius: '12px', border: '2px dashed var(--border)', marginTop: '1rem'}}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--text-muted)" style={{marginBottom: '0.75rem'}}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                <p style={{fontWeight: 600, fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem'}}>No team members yet</p>
                <p style={{fontSize: '0.85rem', margin: 0, color: 'var(--text-muted)'}}>Use the form to invite your first member.</p>
              </div>
            ) : (
              teamMembers.map(member => {
                const avatarStyle = { backgroundColor: member.color };
                const roleClass = `role-badge role-${member.role}`;
                const statusClass = `status-dot ${member.status}`;

                return (
                  <div key={member._id} className="member-card">
                    <div className="member-left">
                      <div className="avatar-wrapper">
                        <div className="avatar-circle" style={avatarStyle}>
                          {member.initials}
                        </div>
                        <div className={statusClass}></div>
                      </div>
                      <div className="member-details">
                        <h4>{member.name}</h4>
                        <p>{member.email}</p>
                      </div>
                    </div>

                    <div className="member-actions">
                      <span className={roleClass}>{member.role}</span>

                      <select
                        className="inline-role-select"
                        value={member.role}
                        onChange={(e) => handleRoleChange(member._id, e.target.value)}
                      >
                        <option value="guest">Guest</option>
                        <option value="operator">Operator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div className="form-panel" style={{padding: '1.5rem'}}>
              <h3 style={{fontSize: '1.1rem', marginBottom: '1rem'}}>RBAC Security Matrix</h3>
              <p style={{fontSize: '0.75rem', color: '#666', margin: '0 0 1rem'}}>
                DeployEase evaluates the <code>Authorization</code> header on each request against this access matrix:
              </p>
              <table className="rbac-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Guest</th>
                    <th>Operator</th>
                    <th>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>View Dashboard</td>
                    <td className="rbac-allowed">✔</td>
                    <td className="rbac-allowed">✔</td>
                    <td className="rbac-allowed">✔</td>
                  </tr>
                  <tr>
                    <td>View Node Map</td>
                    <td className="rbac-allowed">✔</td>
                    <td className="rbac-allowed">✔</td>
                    <td className="rbac-allowed">✔</td>
                  </tr>
                  <tr>
                    <td>Register Service</td>
                    <td className="rbac-denied">✘</td>
                    <td className="rbac-allowed">✔</td>
                    <td className="rbac-allowed">✔</td>
                  </tr>
                  <tr>
                    <td>Trigger Build</td>
                    <td className="rbac-denied">✘</td>
                    <td className="rbac-allowed">✔</td>
                    <td className="rbac-allowed">✔</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <form className="form-panel" style={{padding: '1.5rem'}} onSubmit={handleAddMember}>
              <h3 style={{fontSize: '1.1rem', marginBottom: '1rem'}}>Invite New Member</h3>

              <div className="form-group" style={{marginBottom: '1rem'}}>
                <label className="form-label" style={{fontSize: '0.8rem'}} htmlFor="memberName">Full Name</label>
                <input
                  id="memberName"
                  type="text"
                  className="form-input"
                  style={{padding: '0.5rem 0.75rem', fontSize: '0.85rem'}}
                  placeholder="e.g., Jane Doe"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{marginBottom: '1rem'}}>
                <label className="form-label" style={{fontSize: '0.8rem'}} htmlFor="memberEmail">Email Address</label>
                <input
                  id="memberEmail"
                  type="email"
                  className="form-input"
                  style={{padding: '0.5rem 0.75rem', fontSize: '0.85rem'}}
                  placeholder="jane.d@deployease.io"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{marginBottom: '1rem'}}>
                <label className="form-label" style={{fontSize: '0.8rem'}} htmlFor="memberRole">Assigned Role</label>
                <select
                  id="memberRole"
                  className="form-select"
                  style={{padding: '0.5rem 0.75rem', fontSize: '0.85rem'}}
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                >
                  <option value="guest">Guest (Read-only)</option>
                  <option value="operator">Operator (Deployer)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>

              <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{flex: 1.2, padding: '0.5rem', fontSize: '0.85rem'}}
                >
                  Invite Directly
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{flex: 0.8, padding: '0.5rem', fontSize: '0.85rem', borderColor: 'var(--primary)', color: 'var(--primary)'}}
                  onClick={handleGenerateInviteLink}
                >
                  Get Link
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="root">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            <div className="toast-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <div className="toast-message">{toast.message}</div>
          </div>
        ))}
      </div>

      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="top-nav-brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z" fill="#D33833"/>
          </svg>
          <h1>DeployEase</h1>
        </div>

        <div className="top-nav-center">
          <div className="search-bar">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search deployments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="top-nav-links">
          <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>Dashboard</button>
          <button className={activeTab === 'observability' ? 'active' : ''} onClick={() => setActiveTab('observability')}>Nodes</button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="page-container">

        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <ul className="sidebar-menu">
            <li>
              <button className={activeSidebar === 'dashboard' ? 'active' : ''} onClick={() => {setActiveSidebar('dashboard'); setActiveTab('services');}}>
                <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                Dashboard
              </button>
            </li>
            <li>
              <button className={activeSidebar === 'new' ? 'active' : ''} onClick={() => setActiveSidebar('new')}>
                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                New Item
              </button>
            </li>
            <li>
              <button className={activeSidebar === 'people' ? 'active' : ''} onClick={() => setActiveSidebar('people')}>
                <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                People
              </button>
            </li>
            <li>
              <button className={activeSidebar === 'history' ? 'active' : ''} onClick={() => setActiveSidebar('history')}>
                <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                Build History
              </button>
            </li>
            <li>
              <button className={activeSidebar === 'manage' ? 'active' : ''} onClick={() => {setActiveSidebar('manage'); setActiveTab('observability');}}>
                <svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                Manage DeployEase
              </button>
            </li>
          </ul>
        </aside>

        {/* Content Area */}
        <main className="main-content">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #d1d5db', paddingBottom: '1rem'}}>
            <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#333'}}>
              {activeSidebar === 'dashboard' ? 'Deployment Dashboard' :
               activeSidebar === 'manage' ? 'System Information' :
               activeSidebar === 'new' ? 'Register New Service' :
               activeSidebar === 'people' ? 'Team & Access Control' :
               'Under Construction'}
            </h2>
            <span style={{fontSize: '0.875rem', color: '#666'}}>Last sync: {lastRefreshed}</span>
          </div>

          {renderIdentityBanner()}

          {loading ? (
            <div className="loading">Initializing connection...</div>
          ) : (
            (activeSidebar === 'dashboard' || activeSidebar === 'manage') ?
              (activeTab === 'services' ? renderServices() : renderHealth()) :
              activeSidebar === 'new' ? renderNewItem() :
              activeSidebar === 'people' ? renderPeople() :
              <p style={{color: '#666'}}>This feature is simulated for demonstration purposes.</p>
          )}

          <footer>
            &copy; 2026 DeployEase. Open Source Automation Server Theme.
          </footer>
        </main>

      </div>
    </div>
  )
}

export default App
