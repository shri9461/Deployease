const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const config = require('./config');
const authRouter = require('./routes/auth');
const Deployment = require('./models/Deployment');
const TeamMember = require('./models/TeamMember');

const app = express();
const PORT = config.port;
const JWT_SECRET = config.jwtSecret;

app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ────────────────────────────
mongoose.connect(config.mongoUri)
  .then(() => console.log('✅ MongoDB connected:', config.mongoUri))
  .catch(err => console.error('❌ MongoDB connection error:', err));

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected from:', config.mongoUri);
});
mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected to:', config.mongoUri);
});

// ─── JWT Auth Middleware ───────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// ─── RBAC Middleware ──────────────────────────────
const checkRole = (role) => (req, res, next) => {
  const userRole = req.user?.role || req.headers['x-user-role'] || 'guest';
  if (userRole === role || userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  }
};

// ─── Auth Routes ──────────────────────────────────
app.use('/api/auth', authRouter);

// ─── Seed initial deployments if collection is empty ──
const seedInitialData = async () => {
  try {
    const count = await Deployment.countDocuments();
    if (count === 0) {
      await Deployment.insertMany([
        { name: 'Main API', status: 'online', lastDeploy: '2026-05-06 10:00', version: 'v1.2.4', logs: ['Server started', 'DB connected'] },
        { name: 'Auth Service', status: 'online', lastDeploy: '2026-05-05 15:30', version: 'v1.1.0', logs: ['Auth ready'] },
        { name: 'Image Processor', status: 'offline', lastDeploy: '2026-05-04 09:15', version: 'v0.9.8', logs: ['GPU error'] },
        { name: 'Notification Hub', status: 'online', lastDeploy: '2026-05-06 14:00', version: 'v2.0.1', logs: ['SNS linked'] },
      ]);
      console.log('📦 Seeded initial deployment data');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
};

mongoose.connection.once('open', seedInitialData);

// ─── Deployment Routes ────────────────────────────

// GET all deployments (authenticated)
app.get('/api/deployments', verifyToken, async (req, res) => {
  try {
    const deployments = await Deployment.find().sort({ createdAt: -1 });
    res.json(deployments);
  } catch (err) {
    console.error('Fetch deployments error:', err);
    res.status(500).json({ message: 'Server error fetching deployments.' });
  }
});

// POST create deployment (authenticated + operator role)
app.post('/api/deployments',
  verifyToken,
  checkRole('operator'),
  [
    body('name').isString().trim().notEmpty().withMessage('Name is required').escape(),
    body('version').optional().isString().trim().escape(),
    body('status').optional().isIn(['online', 'offline']).withMessage('Status must be online or offline'),
    body('initialLog').optional().isString().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, version = 'v1.0.0', status = 'online', initialLog } = req.body;

      const newDeployment = await Deployment.create({
        name,
        status,
        version: version || 'v1.0.0',
        lastDeploy: new Date().toISOString().replace('T', ' ').substring(0, 16),
        logs: [
          `[${new Date().toLocaleTimeString()}] Service created.`,
          initialLog ? `[Initial Log] ${initialLog}` : 'No initial logs provided.'
        ],
        createdBy: req.user.id
      });

      res.status(201).json({ message: 'Service created successfully', deployment: newDeployment });
    } catch (err) {
      console.error('Create deployment error:', err);
      res.status(500).json({ message: 'Server error creating service.' });
    }
  }
);

// POST trigger deploy (authenticated + operator role)
app.post('/api/deploy/:id',
  verifyToken,
  checkRole('operator'),
  async (req, res) => {
    try {
      const deployment = await Deployment.findById(req.params.id);
      if (!deployment) {
        return res.status(404).json({ message: 'Deployment not found' });
      }

      deployment.status = 'deploying';
      deployment.logs.push(`[${new Date().toLocaleTimeString()}] Deployment triggered by ${req.user.name || req.user.role}`);
      await deployment.save();

      // Simulate deployment completion after 5 seconds
      setTimeout(async () => {
        try {
          const d = await Deployment.findById(req.params.id);
          if (d) {
            d.status = 'online';
            d.lastDeploy = new Date().toISOString().replace('T', ' ').substring(0, 16);
            d.logs.push(`[${new Date().toLocaleTimeString()}] Rollout complete.`);
            await d.save();
          }
        } catch (err) {
          console.error('Deploy completion error:', err);
        }
      }, 5000);

      res.json({ message: 'Deployment started', deployment });
    } catch (err) {
      console.error('Deploy error:', err);
      res.status(500).json({ message: 'Server error triggering deploy.' });
    }
  }
);

// ─── Team Member Routes ───────────────────────────

// GET all team members (authenticated)
app.get('/api/team', verifyToken, async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    console.error('Fetch team error:', err);
    res.status(500).json({ message: 'Server error fetching team.' });
  }
});

// POST add team member (authenticated)
app.post('/api/team',
  verifyToken,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('role').optional().isIn(['guest', 'operator', 'admin']).withMessage('Invalid role')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { name, email, role = 'guest' } = req.body;

      // Check if member already exists
      const existing = await TeamMember.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'A team member with this email already exists.' });
      }

      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const colors = ['#dc2626', '#2563eb', '#16a34a', '#db2777', '#7c3aed', '#ea580c'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const member = await TeamMember.create({
        name,
        email,
        role,
        status: 'online',
        initials,
        color: randomColor,
        addedBy: req.user.id
      });

      res.status(201).json(member);
    } catch (err) {
      console.error('Add team member error:', err);
      res.status(500).json({ message: 'Server error adding team member.' });
    }
  }
);

// PUT update team member role (authenticated)
app.put('/api/team/:id',
  verifyToken,
  [
    body('role').isIn(['guest', 'operator', 'admin']).withMessage('Invalid role')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const member = await TeamMember.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true }
      );
      if (!member) {
        return res.status(404).json({ message: 'Team member not found.' });
      }
      res.json(member);
    } catch (err) {
      console.error('Update team member error:', err);
      res.status(500).json({ message: 'Server error updating team member.' });
    }
  }
);

// ─── Health ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: {
      status: dbStatus,
      uri: config.mongoUri,
      name: mongoose.connection.name || 'deployease'
    },
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage().rss
  });
});

// ─── Start Server ─────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'dev'} mode`);
  });
}

module.exports = app;
