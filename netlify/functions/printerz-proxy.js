const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const { templateId, printerzData } = requestBody;

    // Validate required fields
    if (!templateId || !printerzData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: templateId and printerzData' })
      };
    }

    // Get API key from environment variables
    const apiKey = process.env.VITE_PRINTERZ_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Make the request to Printerz API
    const response = await fetch(`https://api.printerz.dev/templates/${templateId}/render`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(printerzData)
    });

    // If the API call failed, return the error
    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: errorText
      };
    }

    // Get the PDF data as an ArrayBuffer
    const pdfBuffer = await response.arrayBuffer();

    // Return the PDF as binary data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="transcription.pdf"'
      },
      body: Buffer.from(pdfBuffer).toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Error in printerz-proxy function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};