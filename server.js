/**
 * Simple Express Server for Local Webhook Testing
 * Auto-detects port and provides webhook URL
 * Run this alongside your Vite dev server to test webhooks locally
 */

import express from 'express';
import cors from 'cors';
import retellWebhookHandler from './api/retell-webhook.js';
import getWebTokenHandler from './api/retell-get-web-token.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'retell-webhook-server' });
});

// Retell webhook endpoint
app.post('/api/retell-webhook', async (req, res) => {
  await retellWebhookHandler(req, res);
});

// Retell web token endpoint (for browser testing)
app.post('/api/retell-get-web-token', async (req, res) => {
  console.log('🔑 Web token request received');
  await getWebTokenHandler(req, res);
});

// Start server
app.listen(PORT, () => {
  const webhookUrl = `http://localhost:${PORT}/api/retell-webhook`;
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🚀 WEBHOOK & API SERVER RUNNING`);
  console.log(`${'═'.repeat(60)}\n`);
  console.log(`   🌐 Local URL: http://localhost:${PORT}`);
  console.log(`   🔔 Webhook URL: ${webhookUrl}`);
  console.log(`   🎤 Web Token URL: http://localhost:${PORT}/api/retell-get-web-token`);
  console.log(`   ✅ Status: Ready!\n`);
  
  console.log(`${'─'.repeat(60)}\n`);
  console.log(`📋 AVAILABLE ENDPOINTS:\n`);
  console.log(`   GET  /health`);
  console.log(`   POST /api/retell-webhook`);
  console.log(`   POST /api/retell-get-web-token  (for browser testing)\n`);
  
  console.log(`${'═'.repeat(60)}\n`);
  
  // Write webhook URL to file for reference
  const webhookConfig = {
    port: PORT,
    localWebhookUrl: webhookUrl,
    webTokenUrl: `http://localhost:${PORT}/api/retell-get-web-token`,
    timestamp: new Date().toISOString(),
  };
  
  try {
    writeFileSync(
      join(process.cwd(), '.webhook-info.json'),
      JSON.stringify(webhookConfig, null, 2)
    );
  } catch (err) {
    // Ignore write errors
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down webhook server...');
  process.exit(0);
});
