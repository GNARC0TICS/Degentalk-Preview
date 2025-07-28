
async function testThreadApi() {
  // Use the correct UUID for market-analysis forum
  const marketAnalysisId = 'fbeb1da9-9f32-404b-bb09-72541dce2b85';
  
  const url = `http://localhost:5001/api/forum/threads?structureId=${marketAnalysisId}&page=1&limit=10`;
  
  console.log('Testing API:', url);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testThreadApi();