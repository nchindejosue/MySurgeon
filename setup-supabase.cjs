#!/usr/bin/env node

/**
 * MySurgeon Supabase Setup Script
 * This script helps automate the Supabase project setup process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function installSupabaseCLI() {
  log('Installing Supabase CLI...', 'yellow');
  try {
    execSync('npm install -g supabase', { stdio: 'inherit' });
    log('✅ Supabase CLI installed successfully!', 'green');
  } catch (error) {
    log('❌ Failed to install Supabase CLI. Please install manually:', 'red');
    log('npm install -g supabase', 'cyan');
    process.exit(1);
  }
}

function initializeSupabase() {
  log('Initializing Supabase project...', 'yellow');
  try {
    execSync('supabase init', { stdio: 'inherit' });
    log('✅ Supabase project initialized!', 'green');
  } catch (error) {
    log('⚠️  Supabase already initialized or error occurred', 'yellow');
  }
}

function startLocalSupabase() {
  log('Starting local Supabase instance...', 'yellow');
  try {
    execSync('supabase start', { stdio: 'inherit' });
    log('✅ Local Supabase instance started!', 'green');
    
    // Get local credentials
    const status = execSync('supabase status', { encoding: 'utf8' });
    const lines = status.split('\n');
    
    let apiUrl = '';
    let anonKey = '';
    
    lines.forEach(line => {
      if (line.includes('API URL')) {
        apiUrl = line.split('│')[2]?.trim() || '';
      }
      if (line.includes('anon key')) {
        anonKey = line.split('│')[2]?.trim() || '';
      }
    });
    
    if (apiUrl && anonKey) {
      updateEnvFile(apiUrl, anonKey);
    }
    
  } catch (error) {
    log('❌ Failed to start local Supabase. Error:', 'red');
    log(error.message, 'red');
  }
}

function updateEnvFile(url, key) {
  const envPath = path.join(__dirname, '.env');
  const envContent = `VITE_SUPABASE_URL=${url}
VITE_SUPABASE_ANON_KEY=${key}`;
  
  try {
    fs.writeFileSync(envPath, envContent);
    log('✅ .env file updated with Supabase credentials!', 'green');
    log(`API URL: ${url}`, 'cyan');
    log(`Anon Key: ${key.substring(0, 20)}...`, 'cyan');
  } catch (error) {
    log('❌ Failed to update .env file:', 'red');
    log(error.message, 'red');
  }
}

function runDatabaseMigrations() {
  log('Running database migrations...', 'yellow');
  try {
    // Copy our SQL setup to migrations
    const sqlContent = fs.readFileSync(path.join(__dirname, 'database-setup.sql'), 'utf8');
    const migrationDir = path.join(__dirname, 'supabase', 'migrations');
    
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const migrationFile = path.join(migrationDir, `${timestamp}_initial_schema.sql`);
    
    fs.writeFileSync(migrationFile, sqlContent);
    
    execSync('supabase db reset', { stdio: 'inherit' });
    log('✅ Database migrations completed!', 'green');
  } catch (error) {
    log('❌ Failed to run migrations:', 'red');
    log(error.message, 'red');
  }
}

function main() {
  log('🏥 MySurgeon Supabase Setup', 'bright');
  log('================================', 'bright');
  
  // Check if Supabase CLI is installed
  if (!checkSupabaseCLI()) {
    log('Supabase CLI not found. Installing...', 'yellow');
    installSupabaseCLI();
  } else {
    log('✅ Supabase CLI found!', 'green');
  }
  
  // Initialize Supabase
  initializeSupabase();
  
  // Start local Supabase
  startLocalSupabase();
  
  // Run migrations
  runDatabaseMigrations();
  
  log('\n🎉 Setup completed!', 'green');
  log('Your MySurgeon platform is ready to use with local Supabase.', 'cyan');
  log('\nNext steps:', 'bright');
  log('1. Run: npm run dev', 'cyan');
  log('2. Open: http://localhost:5173', 'cyan');
  log('3. Access Supabase Studio: http://localhost:54323', 'cyan');
  
  log('\n📝 Note: This setup uses local Supabase for development.', 'yellow');
  log('For production, create a project at https://supabase.com', 'yellow');
}

if (require.main === module) {
  main();
}

module.exports = { main };