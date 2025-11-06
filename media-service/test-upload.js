/**
 * Test script cho Media Service
 * Chạy: node test-upload.js
 */

const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const MEDIA_SERVICE_URL = 'http://localhost:3001';

// Tạo token test
const testToken = jwt.sign(
  {
    sub: 'user-test-123',
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 giờ
  },
  'test-secret'
);

console.log('📝 Test Token:', testToken.substring(0, 50) + '...\n');

// Test upload
async function testUpload() {
  try {
    console.log('🧪 Testing Media Service Upload...\n');

    // Tạo file test (1x1 pixel PNG)
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Test 1: Upload avatar
    console.log('📤 Test 1: Upload Avatar');
    const formData1 = new FormData();
    formData1.append('file', imageBuffer, 'test-avatar.png');
    formData1.append('type', 'avatar');

    const response1 = await axios.post(`${MEDIA_SERVICE_URL}/upload`, formData1, {
      headers: {
        ...formData1.getHeaders(),
        'Authorization': `Bearer ${testToken}`,
      },
    });

    console.log('✅ Success!');
    console.log('   URL:', response1.data.url);
    console.log('   Type:', response1.data.type);
    console.log('   Size:', response1.data.size, 'bytes\n');

    // Test 2: Upload post
    console.log('📤 Test 2: Upload Post (van-hoa)');
    const formData2 = new FormData();
    formData2.append('file', imageBuffer, 'test-image.png');
    formData2.append('type', 'post');
    formData2.append('category', 'van-hoa');

    const response2 = await axios.post(`${MEDIA_SERVICE_URL}/upload`, formData2, {
      headers: {
        ...formData2.getHeaders(),
        'Authorization': `Bearer ${testToken}`,
      },
    });

    console.log('✅ Success!');
    console.log('   URL:', response2.data.url);
    console.log('   Type:', response2.data.type);
    console.log('   Category:', response2.data.category);
    console.log('   Size:', response2.data.size, 'bytes\n');

    // Test 3: Get file
    console.log('📥 Test 3: Get Uploaded File');
    const fileUrl = response1.data.url;
    const getResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    
    console.log('✅ Success!');
    console.log('   Content-Type:', getResponse.headers['content-type']);
    console.log('   Size:', getResponse.data.length, 'bytes\n');

    console.log('🎉 All tests passed!');
    console.log('\n📂 Check files in: media-service/storage/');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testUpload();
