#!/usr/bin/env node
/**
 * Script para gerar config.json a partir de variáveis de ambiente
 * Executado no Docker durante o build
 */

const fs = require('fs');
const path = require('path');

const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || 'https://towmfxficdkrgfwghcer.supabase.co',
  supabasePublishableKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_live_O5iF9eHqrKkxQPvASr7RvxZcTwEm1hq1nJOvTKzAZjWOjdVCM3x4zFLu5wPOhXkc8aZxGOqL7sNR0qrXEY9L',
  appUrl: process.env.VITE_APP_URL || 'https://app-zapfarma.m9uocu.easypanel.host',
};

// Validar que as variáveis críticas estão presentes
if (!config.supabaseUrl || config.supabaseUrl.includes('undefined')) {
  console.warn('⚠️  WARNING: VITE_SUPABASE_URL not set or is undefined');
}
if (!config.supabasePublishableKey || config.supabasePublishableKey.includes('undefined')) {
  console.warn('⚠️  WARNING: VITE_SUPABASE_PUBLISHABLE_KEY not set or is undefined');
}

console.log('📝 Gerando config.json com:');
console.log(`   - supabaseUrl: ${config.supabaseUrl}`);
console.log(`   - supabasePublishableKey: ${config.supabasePublishableKey.substring(0, 20)}...`);
console.log(`   - appUrl: ${config.appUrl}`);

const configPath = path.join(__dirname, '../public/config.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log(`✅ config.json gerado com sucesso em: ${configPath}`);
