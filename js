const http = require('http');
const https = require('https');

// Define the port to listen on and the target site to proxy
const PORT = 3000;
const TARGET_HOST = 'example.com'; 

const server = http.createServer((clientReq, clientRes) => {
    // Set up the options for the request to the target server
    const options = {
        hostname: TARGET_HOST,
        port: 443,
        path: clientReq.url,
        method: clientReq.method,
        headers: {
            ...clientReq.headers,
            host: TARGET_HOST // Overwrite the host header
        }
    };

    // Make the request to the target server
    const proxyReq = https.request(options, (targetRes) => {
        // Forward the status code and headers to the client
        clientRes.writeHead(targetRes.statusCode, targetRes.headers);
        // Pipe the response data back to the client
        targetRes.pipe(clientRes);
    });

    // Handle network errors
    proxyReq.on('error', (err) => {
        console.error('Proxy Error:', err.message);
        clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
        clientRes.end('Bad Gateway');
    });

    // Pipe the client's request data (like POST bodies) to the target server
    clientReq.pipe(proxyReq);
});

server.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
