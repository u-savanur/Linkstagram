document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const siteBadge = document.getElementById('site-badge');
    const urlDisplay = document.getElementById('url-display');
    const errorMsg = document.getElementById('error-message');
    const captureBtn = document.getElementById('capture-btn');
    const btnText = captureBtn.querySelector('.btn-text');
    const spinner = captureBtn.querySelector('.spinner');
    const resultSection = document.getElementById('result-section');
    const resultContent = document.getElementById('result-content');
    const connStatus = document.getElementById('connection-status');
  
    // Backend Configuration
    const API_URL = 'http://localhost:3000/api/scrape-profile';
    const HEALTH_URL = 'http://localhost:3000/health';
  
    // Check Backend Health
    try {
      const health = await fetch(HEALTH_URL);
      if (health.ok) {
        connStatus.textContent = 'Backend Online';
        connStatus.className = 'status-badge online';
      } else {
        throw new Error('Not OK');
      }
    } catch (e) {
      connStatus.textContent = 'Backend Offline';
      connStatus.className = 'status-badge offline';
    }
  
    // Get Current Tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
        showError('No active tab found.');
        return;
    }
  
    const url = tab.url;
    urlDisplay.textContent = url;
  
    // Detect Platform
    let platform = null;
    if (url.includes('linkedin.com/in/')) {
        platform = 'linkedin';
    } else if (url.includes('instagram.com/')) {
        platform = 'instagram';
    }
  
    // Update UI based on detection
    if (platform) {
        siteBadge.textContent = platform === 'linkedin' ? 'LinkedIn' : 'Instagram';
        siteBadge.className = `badge ${platform}`;
        captureBtn.disabled = false;
        errorMsg.classList.add('hidden');
    } else {
        siteBadge.textContent = 'Unsupported';
        siteBadge.className = 'badge unsupported';
        captureBtn.disabled = true;
        errorMsg.classList.remove('hidden');
    }
  
    // Button Click Handler
    captureBtn.addEventListener('click', async () => {
        setLoading(true);
        resultSection.classList.add('hidden');
  
        try {
            // 1. Capture HTML via Script Injection
            const injectionResults = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.documentElement.outerHTML
            });
  
            if (!injectionResults || !injectionResults[0] || !injectionResults[0].result) {
                throw new Error('Failed to capture page HTML. Ensure the page is fully loaded.');
            }
  
            const html = injectionResults[0].result;
  
            // 2. Send to Backend
            btnText.textContent = 'Sending...';
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    html: html
                })
            });
  
            const data = await response.json();
  
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Server returned an error');
            }
  
            // 3. Show Result
            showResult(data);
  
        } catch (error) {
            console.error(error);
            showError(error.message);
        } finally {
            setLoading(false);
        }
    });
  
    function setLoading(isLoading) {
        captureBtn.disabled = isLoading;
        spinner.classList.toggle('hidden', !isLoading);
        btnText.textContent = isLoading ? 'Processing...' : 'Send Page to Backend';
    }
  
    function showError(msg) {
        resultSection.classList.remove('hidden');
        resultContent.textContent = `Error: ${msg}`;
        resultContent.style.color = '#ef4444'; // Red
    }
  
    function showResult(data) {
        resultSection.classList.remove('hidden');
        resultContent.style.color = '#e2e8f0'; // Reset color
        
        // Format for display
        const displayData = data.data || {};
        resultContent.textContent = JSON.stringify(displayData, null, 2);
    }
  });
