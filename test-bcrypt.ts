import bcrypt from 'bcrypt';

async function testBcrypt() {
  const hash = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
  const password = 'password123';
  const wrongPassword = 'wrongpassword';
  
  console.log('Testing bcrypt password comparison...');
  console.log('Hash:', hash);
  console.log('Password:', password);
  
  const result = await bcrypt.compare(password, hash);
  console.log('Password comparison result:', result);
  
  const wrongResult = await bcrypt.compare(wrongPassword, hash);
  console.log('Wrong password comparison result:', wrongResult);
  
  // Generate a new hash to verify bcrypt is working
  const newHash = await bcrypt.hash(password, 10);
  console.log('New hash generated:', newHash);
  
  const newResult = await bcrypt.compare(password, newHash);
  console.log('New hash comparison result:', newResult);
}

testBcrypt().catch(console.error);