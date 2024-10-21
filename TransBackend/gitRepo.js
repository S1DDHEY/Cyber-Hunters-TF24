const express = require('express');
const axios = require('axios'); // Import axios
require('dotenv').config(); // Load environment variables from .env file

let Octokit;
(async () => {
    const module = await import('@octokit/rest');
    Octokit = module.Octokit;  // Make Octokit globally accessible
})();

const router = express.Router();
const GITHUB_API_URL = 'https://api.github.com';

// Helper function to fetch files from a GitHub repository
async function fetchGithubFiles(owner, repo, token) {
    const apiUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,  // Use Bearer for authentication
            },
        });

        const data = response.data; // Axios stores response data in `data`
        return data; // List of files in the repository
    } catch (error) {
        console.error("Error fetching files from GitHub:", error);
        throw error;
    }
}

// Route to analyze a GitHub repository
router.post('/analyze', async (req, res) => {
    const { repoLink } = req.body;
    
    // Log incoming request for debugging
    console.log("Request body:", req.body);
    console.log("Repository Link:", repoLink);

    const token = process.env.GITHUB_API_TOKEN

    // Validate repoLink and token
    if (!repoLink || !repoLink.includes('github.com/')) {
        return res.status(400).json({ error: 'Invalid GitHub repository link.' });
    }

    if (!token) {
        return res.status(500).json({ error: 'GitHub token is missing.' });
    }

    try {
        // Extract owner and repo from the GitHub link
        const repoPath = repoLink.split('github.com/')[1];
        const [owner, repo] = repoPath.split('/');

        // Initialize Octokit with authentication
        const octokit = new Octokit({ auth: token });

        // Fetch repository metadata
        const repoData = await octokit.repos.get({ owner, repo });
        console.log("Owner:", owner);
        console.log("Repository:", repo);

        // Fetch files from the repository
        const { data: files } = await octokit.repos.getContent({ owner, repo, path: '' });

        // Retrieve content of each file and store results
        const results = await Promise.all(files.map(async (file) => {
            const { data: fileContent } = await octokit.repos.getContent({
                owner,
                repo,
                path: file.path
            });

            // Convert base64 content to string
            return {
                fileName: file.name,
                fileContent: Buffer.from(fileContent.content, 'base64').toString('utf-8')
            };
        }));

        // Send the list of files and their content
        res.status(200).json({ filesWithContent: results });

    } catch (error) {
        console.error('Error fetching GitHub repo:', error.message);
        res.status(500).json({ error: 'Error fetching GitHub repository.' });
    }
});



module.exports = router;
