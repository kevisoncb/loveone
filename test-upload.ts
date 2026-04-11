import { getPresignedUploadUrl } from './server/storage';

async function runTest() {
  console.log('🧪 Running S3 upload test...');
  try {
    const fileType = 'image/jpeg';
    const userId = 'test-user-123';
    
    console.log(`Requesting presigned URL for fileType: ${fileType}, userId: ${userId}`);
    
    const result = await getPresignedUploadUrl(fileType, userId);
    
    console.log('✅ Success! Presigned URL generated.');
    console.log('URL:', result.uploadUrl);
    console.log('Key:', result.key);
    console.log('\nThis confirms your server can successfully communicate with your S3 bucket.');

  } catch (error) {
    console.error('❌ Test Failed! An error occurred:');
    console.error(error);
    console.log('\nTroubleshooting steps:');
    console.log('1. Double-check the values in your .env file (bucket name, region, access key, secret key).');
    console.log('2. Ensure the bucket name and region match exactly what is in the AWS S3 console.');
  }
}

runTest();
