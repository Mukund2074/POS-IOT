require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;  // Port for both React and the API

// Check if build directory exists
const buildPath = path.join(__dirname, 'build');
const indexPath = path.join(buildPath, 'index.html');

if (!fs.existsSync(buildPath) || !fs.existsSync(indexPath)) {
    console.error('Error: The React app has not been built yet.');
    console.error('Please run "npm run build" before starting the server.');
    console.error('Exiting...');
    process.exit(1);
}

// Middleware to serve React app
app.use(express.static(buildPath));  // Serve the React build files

// Function to parse test output and extract test results
function parseTestOutput(stdout, stderr) {
    // Initialize results object
    const results = {
        summary: {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0
        },
        tests: [],
    };

    // Combine stdout and stderr for parsing
    const output = (stdout || '') + '\n' + (stderr || '');

    // Split output into lines
    const lines = output.split('\n');

    // Regular expressions to match test results
    const testResultRegex = /^\s*([✓√])\s+(.+)$/;
    const summaryRegex = /Tests:\s+(\d+)\s+passed,\s+(\d+)\s+failed,\s+(\d+)\s+skipped/;

    // Process each line
    for (const line of lines) {
        // Check for test result
        const testMatch = line.match(testResultRegex);
        if (testMatch) {
            const status = 'passed'; // Both ✓ and √ indicate passed tests
            const testName = testMatch[2].trim();

            results.tests.push({
                name: testName,
                status: status
            });

            results.summary.passed++;
            results.summary.total++;
            continue;
        }

        // Check for summary line
        const summaryMatch = line.match(summaryRegex);
        if (summaryMatch) {
            results.summary.passed = parseInt(summaryMatch[1]);
            results.summary.failed = parseInt(summaryMatch[2]);
            results.summary.skipped = parseInt(summaryMatch[3]);
            results.summary.total = results.summary.passed + results.summary.failed + results.summary.skipped;
        }
    }

    return results;
}

// API endpoint to run tests
app.get('/dev/test-1712058734523-x9a7b', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    try {
        // const decoded = jwt.verify(token, SECRET_KEY);
        if (token === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODc2Nzg2ODc2ODc3NjU2NzY3NDY1NDM0MzIiLCJpYXQiOjE3MTIwNTg3MzQsImV4cCI6MTcxMjE0NTEzNH0.SxMJy4KdNyPzXpF5m5UmIBh9VPgCE1Ijxy5mW_h4GAg') {
            exec('npm run test', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.status(500).json({
                        success: false,
                        error: `Error: ${stderr}`,
                        details: error.message
                    });
                }
                // Parse the test output - pass both stdout and stderr
                const testResults = parseTestOutput(stdout, stderr);

                res.json({
                    success: true,
                    results: testResults,
                    raw: {
                        stdout,
                        stderr
                    },
                    timestamp: new Date().toISOString()
                });
            });
        } else {
            return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
        }
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
});

const test_token = process.env.REACT_TEST_TOKEN || ''; // Default to empty string if not set

// app.get('/dev/test-1712058734523-x9a7b', (req, res) => {
//     const testPage = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Running Tests</title>
//     <style>
//     body {
//     display: flex;
//     justify-content: center;  /* Centers horizontally */
//     align-items: center;  /* Centers vertically */
//     height: 100vh;  /* Full viewport height */
//     margin: 0;  /* Remove default margin */
//     background-color: #f5f5f5;  /* Light gray background */
//     font-family: Arial, sans-serif;  /* Clean font */
// }

//        .spinner {
//     width: 40px;
//     height: 40px;
//     border: 4px solid rgba(0, 0, 0, 0.1);
//     border-left-color: #4CAF50; /* Green color */
//     border-radius: 50%;
//     animation: spin 1s linear infinite;
//     display: inline-block;
// }

// @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
// }

//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="spinner"></div>
//     </div>

//     <script>
//         document.addEventListener('DOMContentLoaded', function() {
//             // Function to run tests
//             function runTests() {
//                 fetch('/run-tests', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': 'Bearer ${test_token}'
//                     }
//                 })
//                 .then(response => response.json())
//                 .then(data => {
                    
//                     setTimeout(() => {
//                         window.location.href = '/';
//                     }, 0);
//                 })
//                 .catch(error => {
//                     window.location.href = '/';
//                 });
//             }

//             // Run tests when page loads
//             runTests();
//         });
//     </script>
// </body>
// </html>
//     `;

//     res.send(testPage);
// });


// Handle all other routes by serving the React app
app.use((req, res) => {
    res.sendFile(indexPath);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 