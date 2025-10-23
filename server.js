const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const config = require('./config/config');
const whatsappRoutes = require('./routes/whatsapp.routes');
const adminRoutes = require('./routes/admin.routes');
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'whatsapp-bot-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Serve static files (uploads, admin dashboard)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Connect to Database
connectDB();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    message: 'WhatsApp Commerce Bot API',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check environment variables
app.get('/debug', (req, res) => {
  res.json({
    whatsappProvider: config.whatsapp.provider,
    twilioAccountSid: config.whatsapp.twilio.accountSid ? 'SET' : 'NOT SET',
    twilioAuthToken: config.whatsapp.twilio.authToken ? 'SET' : 'NOT SET',
    twilioWhatsappNumber: config.whatsapp.twilio.whatsappNumber,
    mongodbUri: config.database.mongoUri ? 'SET' : 'NOT SET',
    nodeEnv: config.nodeEnv
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Test sandbox error handling
app.post('/test-sandbox', (req, res) => {
  const { phoneNumber, message } = req.body;
  
  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'phoneNumber and message required' });
  }
  
  console.log('🧪 Testing sandbox error handling:', { phoneNumber, message });
  
  // Simulate the sandbox error detection
  const sandboxPatterns = [
    'not connected to a sandbox',
    'sandbox',
    'your number whatsapp is not connected',
    'not connected',
    'sandbox you need to connect'
  ];
  
  const isSandboxError = sandboxPatterns.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
  
  res.json({
    message: message,
    isSandboxError: isSandboxError,
    detectedPatterns: sandboxPatterns.filter(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    )
  });
});

// Sandbox error detection middleware
app.use('/webhook', (req, res, next) => {
  // Check if the request body contains sandbox error messages
  if (req.body && req.body.Body) {
    const body = req.body.Body.toLowerCase();
    const sandboxPatterns = [
      'not connected to a sandbox',
      'sandbox',
      'your number whatsapp is not connected',
      'not connected',
      'sandbox you need to connect'
    ];
    
    const isSandboxError = sandboxPatterns.some(pattern => 
      body.includes(pattern.toLowerCase())
    );
    
    if (isSandboxError) {
      console.log('🔍 Sandbox error detected in middleware:', req.body.Body);
      // Let the request continue to be handled by our sandbox handler
    }
  }
  next();
});

// WhatsApp webhook routes
app.use('/webhook', whatsappRoutes);

// Admin API routes
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Check if this is a sandbox-related error
  if (err.message && err.message.toLowerCase().includes('sandbox')) {
    console.log('🔍 Sandbox error detected in server middleware:', err.message);
    return res.status(400).json({ 
      error: 'Sandbox connection required',
      message: 'Please join the WhatsApp sandbox first'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error', 
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Bot Server running on port ${PORT}`);
  console.log(`📱 WhatsApp Provider: ${config.whatsapp.provider}`);
  console.log(`🌐 Webhook URL: ${config.app.url}${config.app.webhookPath}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});

module.exports = app;

