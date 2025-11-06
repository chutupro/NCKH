/**
 * Script to clear all Redis keys
 * Run this ONCE after switching from SHA256 to HMAC-SHA256
 * 
 * Usage: node scripts/clear-redis.js
 */

const Redis = require('ioredis');

async function clearRedis() {
  console.log('🔴 WARNING: This will delete ALL keys in Redis!');
  console.log('📋 Affected data:');
  console.log('   - Refresh tokens (users will need to login again)');
  console.log('   - OTP codes (in-progress registrations will fail)');
  console.log('');
  
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
  });

  try {
    // Get all keys
    const keys = await redis.keys('*');
    console.log(`📊 Found ${keys.length} keys in Redis`);
    
    if (keys.length === 0) {
      console.log('✅ Redis already empty. Nothing to do.');
      await redis.quit();
      return;
    }

    // Show key patterns
    const rtKeys = keys.filter(k => k.startsWith('rt:')).length;
    const otpKeys = keys.filter(k => k.startsWith('otp:')).length;
    
    console.log(`   - Refresh tokens (rt:*): ${rtKeys}`);
    console.log(`   - OTP codes (otp:*): ${otpKeys}`);
    console.log('');

    // Flush database
    console.log('🗑️  Flushing database...');
    await redis.flushdb();
    
    console.log('✅ Redis cleared successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Restart backend server (npm run start:dev)');
    console.log('   2. All users need to login again');
    console.log('   3. F5 should work with new HMAC-SHA256 hashing');
    
  } catch (error) {
    console.error('❌ Error clearing Redis:', error.message);
    process.exit(1);
  } finally {
    await redis.quit();
  }
}

clearRedis();
