#!/usr/bin/env node
/**
 * 🔧 Environment Variable Injector for Vite SPA
 * 
 * Este script injeta variáveis de ambiente no HTML em tempo de runtime.
 * Necessário porque Vite bake variáveis no build, não em runtime.
 */

const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, 'dist', 'index.html');

// Variáveis de ambiente esperadas
const ENV_VARS = {
  'VITE_SUPABASE_PROJECT_ID': process.env.VITE_SUPABASE_PROJECT_ID || 'towmfxficdkrgfwghcer',
  'VITE_SUPABASE_PUBLISHABLE_KEY': process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_avEFL6ACZyiq45REDRU2vg_7yyz-XTi',
  'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL || 'https://towmfxficdkrgfwghcer.supabase.co',
  'VITE_APP_URL': process.env.VITE_APP_URL || 'http://localhost:8080'
};

console.log('🔧 Injetando variáveis de ambiente...');
console.log('📝 Varsáveis:', Object.keys(ENV_VARS));

try {
  // Ler o HTML
  let html = fs.readFileSync(INDEX_PATH, 'utf-8');
  
  // Strings de template
  Object.entries(ENV_VARS).forEach(([key, value]) => {
    const placeholder = `\${${key}}`;
    html = html.replace(new RegExp(placeholder, 'g'), value);
    console.log(`✅ ${key} = ${value.substring(0, 20)}...`);
  });

  // Escrever o HTML de volta
  fs.writeFileSync(INDEX_PATH, html, 'utf-8');
  
  console.log('✨ Variáveis injetadas com sucesso em dist/index.html');
} catch (error) {
  console.error('❌ Erro ao injetar variáveis:', error.message);
  process.exit(1);
}
