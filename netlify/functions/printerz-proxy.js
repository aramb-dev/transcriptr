const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Set a longer timeout for the function (10 seconds)
  context.callbackWaitsForEmptyEventLoop = true;
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

    console.log(`Making request to Printerz API for template: ${templateId}`);
    console.log(`Data size being sent: ${JSON.stringify(printerzData).length} characters`);
    
    // Create an AbortController for the timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 25000); // 25 second timeout
    
    try {
      // Make the request to Printerz API with timeout
      const response = await fetch(`https://api.printerz.dev/templates/${templateId}/render`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(printerzData),
        signal: controller.signal
      });
      
      // Clear the timeout as the request completed
      clearTimeout(timeout);
      
      console.log(`Printerz API response received, status: ${response.status}`);
      console.log(`Response headers: ${JSON.stringify(Object.fromEntries([...response.headers.entries()]))}`);

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
      
      // Add logging for debugging
      console.log(`PDF buffer received from Printerz API. Buffer length: ${pdfBuffer.byteLength}`);
      
      if (pdfBuffer.byteLength === 0) {
        console.error('Error: Received empty PDF from Printerz API');
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            error: 'Empty PDF received from Printerz API', 
            responseStatus: response.status,
            responseHeaders: Object.fromEntries([...response.headers.entries()]),
            bufferSize: pdfBuffer.byteLength 
          })
        };
      }

      // Return the PDF as binary data
      const base64Data = Buffer.from(pdfBuffer).toString('base64');
      console.log(`Encoded PDF size: ${base64Data.length} characters`);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="transcription.pdf"'
        },
        body: base64Data,
        isBase64Encoded: true
      };
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('Request to Printerz API timed out');
        return {
          statusCode: 504,
          body: JSON.stringify({ error: 'Gateway Timeout', message: 'Request to Printerz API timed out' })
        };
      }
      throw fetchError; // Re-throw to be caught by the outer try/catch
    } finally {
      clearTimeout(timeout); // Ensure timeout is cleared in case of errors
    }
  } catch (error) {
    console.error('Error in printerz-proxy function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};