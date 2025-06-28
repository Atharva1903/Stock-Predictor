// Wake-up service for Render free tier
// Run this on a free service like UptimeRobot or GitHub Actions

const https = require('https');

const services = [
  'https://stock-predictor-backend.onrender.com',
  'https://stock-predictor-frontend.onrender.com'
];

function pingService(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      console.log(`✅ ${url} - Status: ${res.statusCode}`);
      resolve(res.statusCode);
    }).on('error', (err) => {
      console.log(`❌ ${url} - Error: ${err.message}`);
      reject(err);
    });
  });
}

async function wakeUpServices() {
  console.log('🔄 Waking up services...');
  const timestamp = new Date().toISOString();
  console.log(`⏰ Time: ${timestamp}`);
  
  for (const service of services) {
    try {
      await pingService(service);
    } catch (error) {
      console.log(`Failed to ping ${service}: ${error.message}`);
    }
  }
  
  console.log('✅ Wake-up complete!\n');
}

// Run immediately
wakeUpServices();

// Run every 10 minutes (600,000 ms)
setInterval(wakeUpServices, 10 * 60 * 1000);

console.log('🚀 Wake-up service started!');
console.log('📡 Pinging services every 10 minutes...'); 