import fetch from 'node-fetch';

export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the URL from the request body
    const body = JSON.parse(event.body);
    const { url } = body;

    if (!url || !url.includes('firebasestorage.googleapis.com')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid or missing Firebase Storage URL' })
      };
    }

    console.log(`Proxying request to Firebase Storage: ${url}`);

    // Fetch the content from Firebase Storage
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `Firebase Storage error: ${response.status}`,
          message: await response.text()
        })
      };
    }

    // Get the file content as buffer
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type');

    // Return the file content
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Error proxying Firebase Storage request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unknown error occurred' })
    };
  }
}