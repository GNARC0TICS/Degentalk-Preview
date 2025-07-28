const http = require('http');

async function testForumHierarchy() {
  try {
    const data = await new Promise((resolve, reject) => {
      http.get('http://localhost:5001/api/forums/structure', (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
    
    if (!data.success) {
      console.error('❌ API returned error:', data.error);
      return;
    }
    
    console.log('🔍 Forum Hierarchy Test Results:\n');
    
    const forums = data.data.forums || [];
    const parentsWithChildren = forums.filter(f => f.children && f.children.length > 0);
    
    console.log(`📊 Total forums: ${forums.length}`);
    console.log(`👨‍👧‍👦 Parent forums: ${parentsWithChildren.length}\n`);
    
    parentsWithChildren.forEach(parent => {
      console.log(`📁 ${parent.name}`);
      console.log(`   Threads: ${parent.threadCount} | Posts: ${parent.postCount}`);
      console.log(`   Children (${parent.children.length}):`);
      
      parent.children.forEach(child => {
        console.log(`   └─ ${child.name}: ${child.threadCount} threads, ${child.postCount} posts`);
      });
      
      // Calculate expected totals
      const expectedThreads = parent.children.reduce((sum, c) => sum + (c.threadCount || 0), 0);
      const expectedPosts = parent.children.reduce((sum, c) => sum + (c.postCount || 0), 0);
      
      console.log(`   ✓ Thread count ${parent.threadCount === expectedThreads ? '✅ correct' : `❌ mismatch (expected ${expectedThreads})`}`);
      console.log(`   ✓ Post count ${parent.postCount === expectedPosts ? '✅ correct' : `⚠️  differs (child sum: ${expectedPosts})`}`);
      console.log('');
    });
    
    // Test specific forum
    const thePit = forums.find(f => f.slug === 'the-pit');
    if (thePit) {
      console.log('🎯 Specific Test - The Pit:');
      console.log(`   Has children: ${thePit.children ? '✅' : '❌'}`);
      console.log(`   Children populated: ${thePit.children?.length > 0 ? '✅' : '❌'}`);
      console.log(`   Shows aggregated counts: ${thePit.threadCount > 0 ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testForumHierarchy();