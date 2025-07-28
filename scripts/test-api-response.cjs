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
      
      if (json.data && json.data.forums) {
        console.log('=== API Response Analysis ===');
        console.log('Total forums:', json.data.forums.length);
        
        // Find The Pit
        const thePit = json.data.forums.find(f => f.slug === 'the-pit');
        if (thePit) {
          console.log('\nThe Pit:', {
            name: thePit.name,
            threadCount: thePit.threadCount,
            postCount: thePit.postCount,
            children: thePit.children ? thePit.children.length : 0
          });
          
          if (thePit.children) {
            console.log('\nChild forums:');
            thePit.children.forEach(child => {
              console.log(`  - ${child.name}: ${child.threadCount} threads, ${child.postCount} posts`);
            });
          }
        }
        
        // Check field names across all forums
        console.log('\n=== Field Name Check ===');
        const forum = json.data.forums[0];
        console.log('Sample forum fields:', Object.keys(forum).filter(k => k.includes('ount')));
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', error => {
  console.error('Request failed:', error);
});

req.end();