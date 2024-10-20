const express = require('express');
const axios = require('axios'); // Import axios
require('dotenv').config();
let Octokit;
(async () => {
    const module = await import('@octokit/rest');
    Octokit = module.Octokit;  // Make Octokit globally accessible
})();


const router = express.Router();

const GITHUB_API_URL = 'https://api.github.com';

// Helper function to fetch files from a GitHub repository
async function fetchGithubFiles(owner, repo) {
    const apiUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents`;
    // const token = "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" ;
    const token = "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" ;
    

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `token ${token}`,
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
  
    // Ensure Octokit is initialized
    if (!Octokit) {
      console.log("hello");
      return res.status(500).json({ error: 'Octokit is not initialized yet. Please try again.' });
    }
  
    try {
      // Extract owner and repo from the GitHub link
      const [owner, repo] = repoLink.split('github.com/')[1].split('/');
      const octokit = new Octokit();
  
      // Fetch repository metadata
      const { data: repoData } = await octokit.repos.get({ owner, repo });
  
      // Get the list of files in the repository
      const { data: files } = await octokit.repos.getContent({ owner, repo, path: '' });
  
      // Initialize an array to hold the results
      const results = [];
  
      // Fetch content for each file and store in results array
      const filesWithContent = await Promise.all(files.map(async (file) => {
        const { data: fileContent } = await octokit.repos.getContent({
          owner,
          repo,
          path: file.path
        });
  
        // Decode file content and add to results array as object
        results.push({
          fileName: file.name,
          fileContent: Buffer.from(fileContent.content, 'base64').toString('utf-8') // Convert content from base64
        });
  
        return {
          fileName: file.name,
          fileContent: Buffer.from(fileContent.content, 'base64').toString('utf-8')
        };
      }));
  
      // Send the results array as a JSON response
      res.status(200).json({ filesWithContent: results });
  
    } catch (error) {
      console.error('Error fetching GitHub repo:', error);
      res.status(500).json({ error: 'Error fetching GitHub repository.' });
    }
  });
  

router.get("/view" ,async(req , res) => {
    res.send("working on git");
} )

module.exports = router;
