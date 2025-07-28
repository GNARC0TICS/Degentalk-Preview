const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/forums/structure',
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.data) {
        console.log('=== Forum Distribution ===');
        console.log('Featured forums:', json.data.featured?.length || 0);
        console.log('General forums:', json.data.general?.length || 0);
        console.log('All forums:', json.data.forums?.length || 0);
        
        // Check isFeatured flag
        console.log('\n=== Forums with isFeatured flag ===');
        json.data.forums?.forEach(forum => {
          console.log(`${forum.name}: isFeatured = ${forum.isFeatured}`);
        });
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e.message);
    }
  });
});

req.on('error', error => {
  console.error('Request failed:', error);
});

req.end();