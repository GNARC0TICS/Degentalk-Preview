// Simple script to verify the context is getting the right data
console.log(`
Add this temporary debug code to /client/src/pages/forums/index.tsx after line 34:

console.log('Forum Context Debug:', {
  zonesLength: topLevelForums.length,
  firstForum: topLevelForums[0] ? {
    name: topLevelForums[0].name,
    threadCount: topLevelForums[0].threadCount,
    postCount: topLevelForums[0].postCount
  } : null,
  thePit: topLevelForums.find(f => f.slug === 'the-pit')
});

This will help us see what data the component is receiving.
`);