const express = require('express');
const cors = require('cors');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { PORT, NODE_ENV } = require('./config/keys');
const { connectMainDatabase } = require('./config/db');
const webhookRoutes = require('./routes/webhookRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Payment gateway API is running.' });
});

app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/admin', adminRoutes);

if (NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../frontend/dist');
  const frontendIndexPath = path.join(frontendDistPath, 'index.html');

  if (fs.existsSync(frontendIndexPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res) => {
      res.sendFile(frontendIndexPath);
    });
  } else {
    app.get('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Frontend build not found. Deploy the frontend separately on Vercel and point the browser to that app.'
      });
    });
  }
}

const startServer = async () => {
  try {
    await connectMainDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
