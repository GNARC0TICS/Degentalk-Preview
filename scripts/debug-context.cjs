// Add this temporary code to the browser console to debug the context:

console.log(`
To debug the forum context, add this code temporarily to ForumStructureProvider after line 590:

console.log('Context processing:', {
  isUsingFallback,
  topLevelForumsCount: topLevelForums.length,
  featuredCount: featuredForums.length, 
  generalCount: generalForums.length,
  sampleForums: topLevelForums.slice(0, 3).map(f => ({
    name: f.name,
    isFeatured: f.isFeatured,
    id: f.id
  }))
});

This will help us see if the context is processing the data correctly.
`);