export const loginHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Copilot API - Login</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 2rem;
      width: 100%;
      max-width: 360px;
    }
    .login-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .login-title svg { width: 24px; height: 24px; }
    .login-subtitle { color: #8b949e; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    .label { font-size: 0.875rem; color: #8b949e; margin-bottom: 0.25rem; display: block; }
    .input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #30363d;
      border-radius: 6px;
      background: #21262d;
      color: #c9d1d9;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.15s;
    }
    .input:focus { border-color: #58a6ff; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid #30363d;
      border-radius: 6px;
      background: #238636;
      color: #fff;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.15s;
      width: 100%;
    }
    .btn:hover { background: #2ea043; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .error-msg { color: #f85149; font-size: 0.75rem; margin-top: 0.5rem; display: none; }
    .hint { color: #8b949e; font-size: 0.75rem; margin-top: 1rem; text-align: center; }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="login-title">
      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
      Copilot API
    </div>
    <p class="login-subtitle">Sign in to admin dashboard</p>
    <form id="loginForm">
      <div class="form-group">
        <label class="label" for="username">Username</label>
        <input class="input" type="text" id="username" autocomplete="username" required>
      </div>
      <div class="form-group">
        <label class="label" for="password">Password</label>
        <input class="input" type="password" id="password" autocomplete="current-password" required>
      </div>
      <div class="error-msg" id="errorMsg"></div>
      <button class="btn" type="submit" id="loginBtn">Sign in</button>
    </form>
    <p class="hint">Default: admin / copilot-api-admin</p>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      const errorMsg = document.getElementById('errorMsg');
      btn.disabled = true;
      errorMsg.style.display = 'none';
      try {
        const res = await fetch('/admin/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
          })
        });
        const data = await res.json();
        if (data.success) {
          window.location.href = '/admin';
        } else {
          errorMsg.textContent = data.error?.message || 'Login failed';
          errorMsg.style.display = 'block';
        }
      } catch (err) {
        errorMsg.textContent = 'Connection error';
        errorMsg.style.display = 'block';
      } finally {
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>`

export const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Copilot API - Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    h1 svg { width: 24px; height: 24px; }
    .header-actions { margin-left: auto; display: flex; gap: 0.5rem; }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .card-title { font-size: 1rem; font-weight: 600; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid #30363d;
      border-radius: 6px;
      background: #21262d;
      color: #c9d1d9;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.15s;
    }
    .btn:hover { background: #30363d; }
    .btn-primary { background: #238636; border-color: #238636; color: #fff; }
    .btn-primary:hover { background: #2ea043; }
    .btn-danger { background: #da3633; border-color: #da3633; color: #fff; }
    .btn-danger:hover { background: #f85149; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #30363d;
      padding-bottom: 0.5rem;
      flex-wrap: wrap;
    }
    .tab {
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      color: #8b949e;
      cursor: pointer;
      font-size: 0.875rem;
      border-radius: 6px 6px 0 0;
      transition: all 0.15s;
    }
    .tab:hover { color: #c9d1d9; background: #21262d; }
    .tab.active { color: #c9d1d9; background: #21262d; border-bottom: 2px solid #238636; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .account-list { list-style: none; }
    .account-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      background: #0d1117;
      border: 1px solid #30363d;
    }
    .account-item.active { border-color: #238636; }
    .account-avatar { width: 40px; height: 40px; border-radius: 50%; background: #30363d; }
    .account-info { flex: 1; }
    .account-name { font-weight: 600; }
    .account-type { font-size: 0.75rem; color: #8b949e; text-transform: capitalize; }
    .account-badge { font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 9999px; background: #238636; color: #fff; }
    .account-actions { display: flex; gap: 0.5rem; }
    .empty-state { text-align: center; padding: 2rem; color: #8b949e; }
    .models-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
    .model-card { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 0.75rem; transition: all 0.15s; }
    .model-card:hover { border-color: #58a6ff; }
    .model-name { font-weight: 600; font-size: 0.875rem; color: #58a6ff; margin-bottom: 0.25rem; word-break: break-all; }
    .model-id { font-size: 0.75rem; color: #8b949e; font-family: monospace; }
    .model-badge { display: inline-block; font-size: 0.625rem; padding: 0.125rem 0.375rem; border-radius: 9999px; background: #21262d; color: #8b949e; margin-top: 0.5rem; }
    .model-badge.premium { background: #9333ea; color: #fff; }
    .usage-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .usage-card { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 1rem; }
    .usage-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .usage-title { font-weight: 600; text-transform: capitalize; }
    .usage-percent { font-size: 0.875rem; color: #8b949e; }
    .usage-bar { height: 8px; background: #21262d; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem; }
    .usage-bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
    .usage-bar-fill.green { background: #238636; }
    .usage-bar-fill.yellow { background: #d29922; }
    .usage-bar-fill.red { background: #da3633; }
    .usage-bar-fill.blue { background: #58a6ff; }
    .usage-stats { display: flex; justify-content: space-between; font-size: 0.75rem; color: #8b949e; }
    .usage-info { margin-top: 1rem; padding: 0.75rem; background: #161b22; border-radius: 6px; font-size: 0.875rem; }
    .usage-info-row { display: flex; justify-content: space-between; padding: 0.25rem 0; }
    .usage-info-label { color: #8b949e; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 100; }
    .modal-overlay.active { display: flex; }
    .modal { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 1.5rem; max-width: 400px; width: 100%; }
    .modal-title { font-size: 1.25rem; margin-bottom: 1rem; }
    .device-code { font-family: monospace; font-size: 2rem; text-align: center; padding: 1rem; background: #0d1117; border-radius: 6px; margin: 1rem 0; letter-spacing: 0.25rem; }
    .modal-text { color: #8b949e; margin-bottom: 1rem; text-align: center; }
    .modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #30363d; border-top-color: #c9d1d9; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .select { padding: 0.5rem; border: 1px solid #30363d; border-radius: 6px; background: #21262d; color: #c9d1d9; font-size: 0.875rem; margin-bottom: 1rem; width: 100%; }
    .label { font-size: 0.875rem; color: #8b949e; margin-bottom: 0.25rem; display: block; }
    .status-bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #161b22; border: 1px solid #30363d; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #da3633; }
    .status-dot.online { background: #238636; }
    .refresh-btn { margin-left: auto; }
    .refresh-btn.loading svg { animation: spin 1s linear infinite; }
    .form-grid { display: grid; gap: 1rem; }
    .input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #30363d;
      border-radius: 6px;
      background: #21262d;
      color: #c9d1d9;
      font-size: 0.875rem;
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid #30363d;
      border-radius: 6px;
      background: #0d1117;
    }
    .checkbox-row input { width: 16px; height: 16px; }
    .hint { color: #8b949e; font-size: 0.75rem; line-height: 1.5; }
    .notice {
      margin-top: 0.75rem;
      padding: 0.75rem;
      border-radius: 6px;
      background: #0d1117;
      border: 1px solid #30363d;
      color: #8b949e;
      font-size: 0.75rem;
    }
    .key-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      background: #0d1117;
      border: 1px solid #30363d;
    }
    .key-info { flex: 1; }
    .key-name { font-weight: 600; }
    .key-preview { font-family: monospace; font-size: 0.75rem; color: #8b949e; }
    .key-date { font-size: 0.75rem; color: #8b949e; }
    .key-full { font-family: monospace; font-size: 0.875rem; background: #0d1117; padding: 0.75rem; border-radius: 6px; border: 1px solid #30363d; word-break: break-all; margin: 1rem 0; }
    .success-msg { color: #238636; font-size: 0.875rem; margin-top: 0.5rem; }
    .error-msg { color: #f85149; font-size: 0.875rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>
      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
      Copilot API - Dashboard
      <div class="header-actions">
        <button class="btn btn-sm" id="logoutBtn">Logout</button>
      </div>
    </h1>
    <div class="status-bar" id="statusBar">
      <div class="status-dot" id="statusDot"></div>
      <span id="statusText">Checking status...</span>
    </div>
    <div class="tabs">
      <button class="tab active" data-tab="accounts">Accounts</button>
      <button class="tab" data-tab="api-keys">API Keys</button>
      <button class="tab" data-tab="settings">Settings</button>
      <button class="tab" data-tab="models">Models</button>
      <button class="tab" data-tab="usage">Usage</button>
      <button class="tab" data-tab="model-mappings">Model Mappings</button>
      <button class="tab" data-tab="password">Password</button>
    </div>
    <div class="tab-content active" id="tab-accounts">
      <div class="card">
        <div class="card-header">
          <span class="card-title">GitHub Accounts</span>
          <button class="btn btn-primary" id="addAccountBtn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path></svg>
            Add Account
          </button>
        </div>
        <ul class="account-list" id="accountList"><li class="empty-state">Loading accounts...</li></ul>
      </div>
    </div>
    <div class="tab-content" id="tab-api-keys">
      <div class="card">
        <div class="card-header">
          <span class="card-title">API Keys</span>
          <button class="btn btn-primary btn-sm" id="generateKeyBtn">+ Generate New Key</button>
        </div>
        <p class="hint" style="margin-bottom:1rem;">API keys are used to authenticate requests to the /v1/* endpoints. If no keys are configured, all requests are allowed.</p>
        <div id="newKeyForm" style="display:none; margin-bottom:1rem;">
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <input class="input" id="newKeyName" placeholder="Key name (e.g. claude-code)" style="flex:1;">
            <button class="btn btn-primary btn-sm" id="createKeyBtn">Create</button>
            <button class="btn btn-sm" id="cancelKeyBtn">Cancel</button>
          </div>
        </div>
        <div id="newKeyResult" style="display:none; margin-bottom:1rem;">
          <div class="notice" style="border-color:#238636;">
            <strong>New API Key Created</strong> - Copy it now, you won't be able to see it again!
            <div class="key-full" id="newKeyValue"></div>
            <button class="btn btn-sm" id="copyKeyBtn">Copy to Clipboard</button>
            <button class="btn btn-sm" id="dismissKeyBtn" style="margin-left:0.5rem;">Dismiss</button>
          </div>
        </div>
        <div id="apiKeyList"><div class="empty-state">Loading API keys...</div></div>
      </div>
    </div>
    <div class="tab-content" id="tab-models">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Available Models</span>
          <button class="btn btn-sm refresh-btn" id="refreshModels">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"></path></svg>
            Refresh
          </button>
        </div>
        <div class="models-grid" id="modelsList"><div class="empty-state">Loading models...</div></div>
      </div>
    </div>
    <div class="tab-content" id="tab-settings">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Traffic Control</span>
          <button class="btn btn-primary btn-sm" id="saveSettingsBtn">Save</button>
        </div>
        <div class="form-grid">
          <div>
            <label class="label" for="rateLimitSeconds">Rate Limit Seconds</label>
            <input class="input" id="rateLimitSeconds" type="number" min="0" step="1" placeholder="Leave empty to disable">
            <p class="hint">Minimum global interval between requests. Empty means disabled.</p>
          </div>
          <label class="checkbox-row" for="rateLimitWait">
            <input id="rateLimitWait" type="checkbox">
            <span>Wait instead of returning HTTP 429 when rate limit is hit</span>
          </label>
        </div>
        <div class="notice" id="settingsNotice">
          Loading settings...
        </div>
      </div>
    </div>
    <div class="tab-content" id="tab-usage">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Usage Statistics</span>
          <button class="btn btn-sm refresh-btn" id="refreshUsage">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"></path></svg>
            Refresh
          </button>
        </div>
        <div id="usageContent"><div class="empty-state">Loading usage data...</div></div>
      </div>
    </div>
    <div class="tab-content" id="tab-model-mappings">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Model Mappings</span>
          <button class="btn btn-primary btn-sm" id="addMappingBtn">+ Add Mapping</button>
        </div>
        <div id="mappingFormArea" style="display:none; margin-bottom:1rem; padding:0 1rem;">
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <input class="select" id="mappingFrom" placeholder="From model" style="margin:0; flex:1;">
            <span style="color:#8b949e; font-size:1.2rem;">\u2192</span>
            <select class="select" id="mappingTo" style="margin:0; flex:1;"><option value="">Loading models...</option></select>
            <button class="btn btn-primary btn-sm" id="saveMappingBtn">Save</button>
            <button class="btn btn-sm" id="cancelMappingBtn">Cancel</button>
          </div>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:0.875rem;">
          <thead>
            <tr style="color:#8b949e; text-align:left; border-bottom:1px solid #30363d;">
              <th style="padding:0.5rem 1rem;">From</th>
              <th style="padding:0.5rem 1rem;">To</th>
              <th style="padding:0.5rem 1rem; width:80px;">Action</th>
            </tr>
          </thead>
          <tbody id="mappingList"><tr><td colspan="3" class="empty-state">Loading...</td></tr></tbody>
        </table>
      </div>
    </div>
    <div class="tab-content" id="tab-password">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Change Admin Password</span>
        </div>
        <div class="form-grid" style="max-width:400px;">
          <div>
            <label class="label" for="currentPassword">Current Password</label>
            <input class="input" id="currentPassword" type="password" autocomplete="current-password">
          </div>
          <div>
            <label class="label" for="newPassword">New Password</label>
            <input class="input" id="newPassword" type="password" autocomplete="new-password">
            <p class="hint">At least 6 characters</p>
          </div>
          <div>
            <label class="label" for="confirmPassword">Confirm New Password</label>
            <input class="input" id="confirmPassword" type="password" autocomplete="new-password">
          </div>
          <button class="btn btn-primary" id="changePasswordBtn" style="width:fit-content;">Change Password</button>
          <div id="passwordMsg"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="authModal">
    <div class="modal">
      <h2 class="modal-title">Add GitHub Account</h2>
      <div id="authStep1">
        <label class="label">Account Type</label>
        <select class="select" id="accountType">
          <option value="individual">Individual</option>
          <option value="business">Business</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <p class="modal-text">Click below to start the authorization process.</p>
        <div class="modal-actions">
          <button class="btn" id="cancelAuth">Cancel</button>
          <button class="btn btn-primary" id="startAuth">Start Authorization</button>
        </div>
      </div>
      <div id="authStep2" style="display:none">
        <p class="modal-text">Enter this code at GitHub:</p>
        <div class="device-code" id="deviceCode">--------</div>
        <p class="modal-text"><a href="" id="verificationLink" target="_blank" style="color:#58a6ff">Open GitHub</a></p>
        <p class="modal-text"><span class="spinner"></span> Waiting for authorization...</p>
        <div class="modal-actions"><button class="btn" id="cancelAuth2">Cancel</button></div>
      </div>
      <div id="authStep3" style="display:none">
        <p class="modal-text" style="color:#238636">Account added successfully!</p>
        <div class="modal-actions"><button class="btn btn-primary" id="closeAuth">Close</button></div>
      </div>
    </div>
  </div>
  <script>
    const API_BASE = '/admin/api';
    let pollInterval = null;
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        if (tab.dataset.tab === 'settings') fetchSettings();
        if (tab.dataset.tab === 'models') fetchModels();
        if (tab.dataset.tab === 'usage') fetchUsage();
        if (tab.dataset.tab === 'model-mappings') fetchMappings();
        if (tab.dataset.tab === 'api-keys') fetchApiKeys();
      });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await fetch(API_BASE + '/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    });

    // ==================== Settings ====================
    async function fetchSettings() {
      try {
        const res = await fetch(API_BASE + '/settings');
        const data = await res.json();
        document.getElementById('rateLimitSeconds').value = data.rateLimitSeconds ?? '';
        document.getElementById('rateLimitWait').checked = Boolean(data.rateLimitWait);
        const notices = [];
        notices.push('This rate limit is process-wide, not per account or per client.');
        if (data.envOverride?.rateLimitSeconds || data.envOverride?.rateLimitWait) {
          const overrides = [];
          if (data.envOverride.rateLimitSeconds) overrides.push('RATE_LIMIT');
          if (data.envOverride.rateLimitWait) overrides.push('RATE_LIMIT_WAIT');
          notices.push('Environment variables currently override: ' + overrides.join(', ') + '.');
        } else {
          notices.push('Saved values apply immediately and persist in config.json.');
        }
        document.getElementById('settingsNotice').textContent = notices.join(' ');
      } catch (e) {
        document.getElementById('settingsNotice').textContent = 'Failed to load settings.';
      }
    }
    async function saveSettings() {
      const btn = document.getElementById('saveSettingsBtn');
      const rawValue = document.getElementById('rateLimitSeconds').value.trim();
      const rateLimitSeconds = rawValue === '' ? null : Number(rawValue);
      const rateLimitWait = document.getElementById('rateLimitWait').checked;
      if (rawValue !== '' && (!Number.isFinite(rateLimitSeconds) || rateLimitSeconds <= 0)) {
        alert('Rate limit seconds must be greater than 0, or left empty.');
        return;
      }
      btn.disabled = true;
      try {
        const res = await fetch(API_BASE + '/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rateLimitSeconds, rateLimitWait })
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error?.message || 'Failed to save settings');
          return;
        }
        await fetchSettings();
      } catch (e) {
        alert('Failed to save settings');
      } finally {
        btn.disabled = false;
      }
    }

    // ==================== Accounts ====================
    async function fetchAccounts() {
      try {
        const res = await fetch(API_BASE + '/accounts');
        if (res.status === 401) { window.location.href = '/admin/login'; return; }
        const data = await res.json();
        renderAccounts(data);
      } catch (e) {
        document.getElementById('accountList').innerHTML = '<li class="empty-state">Failed to load accounts</li>';
      }
    }
    async function fetchStatus() {
      try {
        const res = await fetch(API_BASE + '/auth/status');
        const data = await res.json();
        const dot = document.getElementById('statusDot');
        const text = document.getElementById('statusText');
        if (data.authenticated) {
          dot.classList.add('online');
          text.textContent = 'Connected as ' + (data.activeAccount?.login || 'Unknown');
        } else {
          dot.classList.remove('online');
          text.textContent = 'Not authenticated';
        }
      } catch (e) {
        document.getElementById('statusText').textContent = 'Connection error';
      }
    }
    function renderAccounts(data) {
      const list = document.getElementById('accountList');
      if (!data.accounts || data.accounts.length === 0) {
        list.innerHTML = '<li class="empty-state">No accounts configured. Click "Add Account" to get started.</li>';
        return;
      }
      list.innerHTML = data.accounts.map(acc => '<li class="account-item ' + (acc.isActive ? 'active' : '') + '">' +
        '<img class="account-avatar" src="' + (acc.avatarUrl || '') + '" alt="" onerror="this.style.display=\\'none\\'">' +
        '<div class="account-info"><div class="account-name">' + acc.login + '</div><div class="account-type">' + acc.accountType + '</div></div>' +
        (acc.isActive ? '<span class="account-badge">Active</span>' : '') +
        '<div class="account-actions">' +
        (!acc.isActive ? '<button class="btn btn-sm" onclick="switchAccount(\\'' + acc.id + '\\')">Switch</button>' : '') +
        '<button class="btn btn-sm btn-danger" onclick="deleteAccount(\\'' + acc.id + '\\', \\'' + acc.login + '\\')">Delete</button>' +
        '</div></li>').join('');
    }
    async function switchAccount(id) {
      if (!confirm('Switch to this account?')) return;
      try {
        const res = await fetch(API_BASE + '/accounts/' + id + '/activate', { method: 'POST' });
        if (res.ok) { fetchAccounts(); fetchStatus(); }
        else { const data = await res.json(); alert(data.error?.message || 'Failed to switch account'); }
      } catch (e) { alert('Failed to switch account'); }
    }
    async function deleteAccount(id, login) {
      if (!confirm('Delete account "' + login + '"? This cannot be undone.')) return;
      try {
        const res = await fetch(API_BASE + '/accounts/' + id, { method: 'DELETE' });
        if (res.ok) { fetchAccounts(); fetchStatus(); }
        else { const data = await res.json(); alert(data.error?.message || 'Failed to delete account'); }
      } catch (e) { alert('Failed to delete account'); }
    }

    // ==================== Models ====================
    async function fetchModels() {
      const btn = document.getElementById('refreshModels');
      btn.classList.add('loading');
      try {
        const res = await fetch('/v1/models');
        const data = await res.json();
        renderModels(data);
      } catch (e) {
        document.getElementById('modelsList').innerHTML = '<div class="empty-state">Failed to load models. Please add an account first.</div>';
      } finally { btn.classList.remove('loading'); }
    }
    function renderModels(data) {
      const container = document.getElementById('modelsList');
      if (!data.data || data.data.length === 0) {
        container.innerHTML = '<div class="empty-state">No models available</div>';
        return;
      }
      container.innerHTML = data.data.map(model => {
        const isPremium = model.id.includes('o1') || model.id.includes('o3') || model.id.includes('claude');
        return '<div class="model-card"><div class="model-name">' + model.id + '</div><div class="model-id">' + (model.object || 'model') + '</div>' +
          (isPremium ? '<span class="model-badge premium">Premium</span>' : '') + '</div>';
      }).join('');
    }

    // ==================== Usage ====================
    async function fetchUsage() {
      const btn = document.getElementById('refreshUsage');
      btn.classList.add('loading');
      try {
        const res = await fetch('/usage');
        const data = await res.json();
        renderUsage(data);
      } catch (e) {
        document.getElementById('usageContent').innerHTML = '<div class="empty-state">Failed to load usage data. Please add an account first.</div>';
      } finally { btn.classList.remove('loading'); }
    }
    function renderUsage(data) {
      const container = document.getElementById('usageContent');
      if (!data.quota_snapshots) {
        container.innerHTML = '<div class="empty-state">No usage data available</div>';
        return;
      }
      const quotas = data.quota_snapshots;
      let html = '<div class="usage-grid">';
      for (const [key, quota] of Object.entries(quotas)) {
        const percentUsed = quota.unlimited ? 0 : (100 - quota.percent_remaining);
        const used = quota.unlimited ? 0 : (quota.entitlement - quota.remaining);
        let barColor = 'green';
        if (percentUsed > 75) barColor = 'yellow';
        if (percentUsed > 90) barColor = 'red';
        if (quota.unlimited) barColor = 'blue';
        html += '<div class="usage-card"><div class="usage-header"><span class="usage-title">' + key.replace(/_/g, ' ') + '</span>' +
          '<span class="usage-percent">' + (quota.unlimited ? 'Unlimited' : percentUsed.toFixed(1) + '% used') + '</span></div>' +
          '<div class="usage-bar"><div class="usage-bar-fill ' + barColor + '" style="width: ' + (quota.unlimited ? 100 : percentUsed) + '%"></div></div>' +
          '<div class="usage-stats"><span>' + (quota.unlimited ? '\u221e' : used.toLocaleString()) + ' / ' + (quota.unlimited ? '\u221e' : quota.entitlement.toLocaleString()) + '</span>' +
          '<span>' + (quota.unlimited ? '\u221e' : quota.remaining.toLocaleString()) + ' remaining</span></div></div>';
      }
      html += '</div>';
      html += '<div class="usage-info"><div class="usage-info-row"><span class="usage-info-label">Plan</span><span>' + (data.copilot_plan || 'Unknown') + '</span></div>' +
        '<div class="usage-info-row"><span class="usage-info-label">Quota Reset Date</span><span>' + (data.quota_reset_date ? new Date(data.quota_reset_date).toLocaleDateString() : 'N/A') + '</span></div>' +
        '<div class="usage-info-row"><span class="usage-info-label">Chat Enabled</span><span>' + (data.chat_enabled ? 'Yes' : 'No') + '</span></div></div>';
      container.innerHTML = html;
    }

    // ==================== Auth Modal ====================
    function showModal(show) {
      document.getElementById('authModal').classList.toggle('active', show);
      if (!show && pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    }
    function showStep(step) {
      document.getElementById('authStep1').style.display = step === 1 ? 'block' : 'none';
      document.getElementById('authStep2').style.display = step === 2 ? 'block' : 'none';
      document.getElementById('authStep3').style.display = step === 3 ? 'block' : 'none';
    }
    async function startAuth() {
      try {
        const res = await fetch(API_BASE + '/auth/device-code', { method: 'POST' });
        const data = await res.json();
        if (data.error) { alert(data.error.message); return; }
        document.getElementById('deviceCode').textContent = data.userCode;
        document.getElementById('verificationLink').href = data.verificationUri;
        showStep(2);
        const accountType = document.getElementById('accountType').value;
        let currentInterval = data.interval || 5;
        pollInterval = setInterval(() => pollAuth(data.deviceCode, accountType), currentInterval * 1000);
      } catch (e) { alert('Failed to start authorization'); }
    }
    let currentInterval = 5;
    async function pollAuth(deviceCode, accountType) {
      try {
        const res = await fetch(API_BASE + '/auth/poll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceCode, accountType })
        });
        const data = await res.json();
        if (data.success) {
          clearInterval(pollInterval);
          pollInterval = null;
          showStep(3);
          setTimeout(() => { fetchAccounts(); fetchStatus(); }, 500);
        } else if (data.error) {
          clearInterval(pollInterval);
          pollInterval = null;
          alert(data.error.message);
          showStep(1);
        } else if (data.slowDown && data.interval) {
          clearInterval(pollInterval);
          currentInterval = data.interval;
          pollInterval = setInterval(() => pollAuth(deviceCode, accountType), currentInterval * 1000);
        }
      } catch (e) {
        console.error('Poll error:', e);
      }
    }
    document.getElementById('addAccountBtn').addEventListener('click', () => { showStep(1); showModal(true); });
    document.getElementById('cancelAuth').addEventListener('click', () => showModal(false));
    document.getElementById('cancelAuth2').addEventListener('click', () => showModal(false));
    document.getElementById('closeAuth').addEventListener('click', () => { showModal(false); showStep(1); });
    document.getElementById('startAuth').addEventListener('click', startAuth);
    document.getElementById('refreshModels').addEventListener('click', fetchModels);
    document.getElementById('refreshUsage').addEventListener('click', fetchUsage);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

    // ==================== API Keys ====================
    async function fetchApiKeys() {
      try {
        const res = await fetch(API_BASE + '/api-keys');
        const data = await res.json();
        renderApiKeys(data.apiKeys || []);
      } catch (e) {
        document.getElementById('apiKeyList').innerHTML = '<div class="empty-state">Failed to load API keys</div>';
      }
    }
    function renderApiKeys(keys) {
      const container = document.getElementById('apiKeyList');
      if (keys.length === 0) {
        container.innerHTML = '<div class="empty-state">No API keys configured. All requests to /v1/* endpoints are currently open.</div>';
        return;
      }
      container.innerHTML = keys.map(k =>
        '<div class="key-item">' +
        '<div class="key-info"><div class="key-name">' + k.name + '</div>' +
        '<div class="key-preview">' + k.keyPreview + '</div>' +
        '<div class="key-date">Created: ' + new Date(k.createdAt).toLocaleDateString() + '</div></div>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteApiKey(\\'' + k.id + '\\', \\'' + k.name + '\\')">Delete</button>' +
        '</div>'
      ).join('');
    }
    document.getElementById('generateKeyBtn').addEventListener('click', () => {
      document.getElementById('newKeyForm').style.display = 'block';
      document.getElementById('newKeyName').value = '';
      document.getElementById('newKeyName').focus();
    });
    document.getElementById('cancelKeyBtn').addEventListener('click', () => {
      document.getElementById('newKeyForm').style.display = 'none';
    });
    document.getElementById('createKeyBtn').addEventListener('click', async () => {
      const name = document.getElementById('newKeyName').value.trim();
      if (!name) { alert('Please enter a name for the API key'); return; }
      try {
        const res = await fetch(API_BASE + '/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('newKeyForm').style.display = 'none';
          document.getElementById('newKeyResult').style.display = 'block';
          document.getElementById('newKeyValue').textContent = data.apiKey.key;
          fetchApiKeys();
        } else {
          alert(data.error?.message || 'Failed to create API key');
        }
      } catch (e) { alert('Failed to create API key'); }
    });
    document.getElementById('copyKeyBtn').addEventListener('click', () => {
      const key = document.getElementById('newKeyValue').textContent;
      navigator.clipboard.writeText(key).then(() => {
        document.getElementById('copyKeyBtn').textContent = 'Copied!';
        setTimeout(() => { document.getElementById('copyKeyBtn').textContent = 'Copy to Clipboard'; }, 2000);
      });
    });
    document.getElementById('dismissKeyBtn').addEventListener('click', () => {
      document.getElementById('newKeyResult').style.display = 'none';
    });
    async function deleteApiKey(id, name) {
      if (!confirm('Delete API key "' + name + '"? This cannot be undone.')) return;
      try {
        const res = await fetch(API_BASE + '/api-keys/' + id, { method: 'DELETE' });
        if (res.ok) fetchApiKeys();
        else { const d = await res.json(); alert(d.error?.message || 'Failed'); }
      } catch (e) { alert('Failed to delete API key'); }
    }
    window.deleteApiKey = deleteApiKey;

    // ==================== Password Change ====================
    document.getElementById('changePasswordBtn').addEventListener('click', async () => {
      const msgEl = document.getElementById('passwordMsg');
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      msgEl.innerHTML = '';
      if (!currentPassword || !newPassword) {
        msgEl.innerHTML = '<div class="error-msg">All fields are required</div>';
        return;
      }
      if (newPassword !== confirmPassword) {
        msgEl.innerHTML = '<div class="error-msg">New passwords do not match</div>';
        return;
      }
      if (newPassword.length < 6) {
        msgEl.innerHTML = '<div class="error-msg">New password must be at least 6 characters</div>';
        return;
      }
      try {
        const res = await fetch(API_BASE + '/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (data.success) {
          msgEl.innerHTML = '<div class="success-msg">Password changed successfully!</div>';
          document.getElementById('currentPassword').value = '';
          document.getElementById('newPassword').value = '';
          document.getElementById('confirmPassword').value = '';
        } else {
          msgEl.innerHTML = '<div class="error-msg">' + (data.error?.message || 'Failed to change password') + '</div>';
        }
      } catch (e) {
        msgEl.innerHTML = '<div class="error-msg">Connection error</div>';
      }
    });

    // ==================== Model Mappings ====================
    async function fetchMappings() {
      try {
        const res = await fetch(API_BASE + '/model-mappings');
        const data = await res.json();
        renderMappings(data.modelMapping || {});
      } catch (e) {
        document.getElementById('mappingList').innerHTML = '<tr><td colspan="3" class="empty-state">Failed to load mappings</td></tr>';
      }
    }
    function renderMappings(mappings) {
      const tbody = document.getElementById('mappingList');
      const entries = Object.entries(mappings);
      if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No mappings configured.</td></tr>';
        return;
      }
      tbody.innerHTML = entries.map(([from, to]) =>
        '<tr style="border-bottom:1px solid #21262d;">' +
        '<td style="padding:0.5rem 1rem; font-family:monospace;">' + from + '</td>' +
        '<td style="padding:0.5rem 1rem; font-family:monospace;">' + to + '</td>' +
        '<td style="padding:0.5rem 1rem;"><button class="btn btn-danger btn-sm" onclick="deleteMapping(\\''+from+'\\')">Delete</button></td>' +
        '</tr>'
      ).join('');
    }
    async function deleteMapping(from) {
      if (!confirm('Delete mapping for "' + from + '"?')) return;
      try {
        const res = await fetch(API_BASE + '/model-mappings/' + encodeURIComponent(from), { method: 'DELETE' });
        if (res.ok) fetchMappings();
        else { const d = await res.json(); alert(d.error?.message || 'Failed'); }
      } catch (e) { alert('Failed to delete mapping'); }
    }
    window.deleteMapping = deleteMapping;
    async function loadModelOptions() {
      const sel = document.getElementById('mappingTo');
      try {
        const res = await fetch('/v1/models');
        const data = await res.json();
        sel.innerHTML = '<option value="">Select target model</option>' +
          (data.data || []).map(m => '<option value="' + m.id + '">' + m.id + '</option>').join('');
      } catch (e) {
        sel.innerHTML = '<option value="">Failed to load models</option>';
      }
    }
    document.getElementById('addMappingBtn').addEventListener('click', () => {
      document.getElementById('mappingFormArea').style.display = 'block';
      document.getElementById('mappingFrom').value = '';
      loadModelOptions();
      document.getElementById('mappingFrom').focus();
    });
    document.getElementById('cancelMappingBtn').addEventListener('click', () => {
      document.getElementById('mappingFormArea').style.display = 'none';
    });
    document.getElementById('saveMappingBtn').addEventListener('click', async () => {
      const from = document.getElementById('mappingFrom').value.trim();
      const to = document.getElementById('mappingTo').value.trim();
      if (!from || !to) { alert('Both fields are required'); return; }
      try {
        const res = await fetch(API_BASE + '/model-mappings/' + encodeURIComponent(from), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to })
        });
        if (res.ok) {
          document.getElementById('mappingFormArea').style.display = 'none';
          fetchMappings();
        } else {
          const d = await res.json();
          alert(d.error?.message || 'Failed to save');
        }
      } catch (e) { alert('Failed to save mapping'); }
    });

    // ==================== Init ====================
    fetchAccounts();
    fetchStatus();
    fetchSettings();
  </script>
</body>
</html>`
