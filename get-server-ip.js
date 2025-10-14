#!/usr/bin/env node

const os = require('os');

/**
 * Get server IP addresses for network access
 */
function getServerIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          name: name,
          address: iface.address,
          netmask: iface.netmask,
        });
      }
    }
  }
  
  return addresses;
}

function displayServerInfo() {
  const port = process.env.PORT || 3000;
  const ips = getServerIPs();
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║   📡 Server Network Information                            ║');
  console.log('║                                                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║                                                            ║');
  console.log(`║   🖥️  Localhost:                                           ║`);
  console.log(`║   http://localhost:${port}/api/docs                         ║`);
  console.log('║                                                            ║');
  
  if (ips.length > 0) {
    console.log('║   🌐 Network Access:                                       ║');
    ips.forEach((ip, index) => {
      const url = `http://${ip.address}:${port}/api/docs`;
      console.log(`║   ${index + 1}. ${ip.name.padEnd(20)} ${ip.address.padEnd(15)} ║`);
      console.log(`║      ${url.padEnd(51)} ║`);
      if (index < ips.length - 1) {
        console.log('║                                                            ║');
      }
    });
  } else {
    console.log('║   ⚠️  No network interfaces found                          ║');
  }
  
  console.log('║                                                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║                                                            ║');
  console.log('║   📱 Share with devices on the same WiFi/LAN:              ║');
  if (ips.length > 0) {
    const mainIP = ips[0].address;
    console.log(`║   http://${mainIP}:${port}/api/docs                         ║`);
  }
  console.log('║                                                            ║');
  console.log('║   🔐 Remember to:                                          ║');
  console.log('║   1. Login first to get Bearer token                      ║');
  console.log('║   2. Click "Authorize" button in Swagger                  ║');
  console.log('║   3. Paste: Bearer <your_token>                           ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

displayServerInfo();
