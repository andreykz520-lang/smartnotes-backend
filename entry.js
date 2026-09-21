const http = require('http');
const next = require('next');
const handleObd2 = require('./obd2/server.js');
const handleAutomechanic = require('./automechanic/server.js');

const dev = false;
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, dir: __dirname });
const handleNext = app.getRequestHandler();

console.log(`[Multi-Site] Initializing SmartNotes, OBD2ScanAI, and AutoMechanic...`);

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const host = (req.headers.host || '').toLowerCase();
    
    // 1. Автомеханик: automechanic.obd2scanai.ru
    if (host.includes('automechanic')) {
      return handleAutomechanic(req, res);
    }

    // 2. OBD2 Сканер: obd2scanai.ru
    if (host.includes('obd2scanai.ru') || host.includes('obd2')) {
      return handleObd2(req, res);
    }

    // 3. SmartNotes AI well-known & metadata discovery
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === '/.well-known/oauth-protected-resource' || pathname === '/.well-known/oauth-protected-resource/' || pathname === '/.well-known/oauth-protected-resource.json') {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify({
        "resource": "https://smartnotes-ai.ru",
        "resource_name": "SmartNotes AI",
        "authorization_servers": [
          "https://smartnotes-ai.ru"
        ],
        "scopes_supported": [
          "notes:read",
          "notes:write"
        ],
        "bearer_methods_supported": [
          "header"
        ],
        "resource_documentation": "https://smartnotes-ai.ru/llms.txt"
      }, null, 2));
    }

    if (pathname === '/.well-known/oauth-authorization-server' || pathname === '/.well-known/oauth-authorization-server.json' || pathname === '/.well-known/openid-configuration' || pathname === '/.well-known/openid-configuration.json') {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify({
        "issuer": "https://smartnotes-ai.ru",
        "authorization_endpoint": "https://smartnotes-ai.ru/auth/authorize",
        "token_endpoint": "https://smartnotes-ai.ru/api/auth/token",
        "revocation_endpoint": "https://smartnotes-ai.ru/api/auth/revoke",
        "jwks_uri": "https://smartnotes-ai.ru/.well-known/jwks.json",
        "response_types_supported": ["code", "token"],
        "grant_types_supported": [
          "authorization_code",
          "client_credentials",
          "urn:ietf:params:oauth:grant-type:jwt-bearer",
          "urn:workos:agent-auth:grant-type:claim"
        ],
        "scopes_supported": ["notes:read", "notes:write"],
        "bearer_methods_supported": ["header"],
        "agent_auth": {
          "skill": "https://smartnotes-ai.ru/auth.md",
          "register_uri": "https://smartnotes-ai.ru/api/agent/register",
          "identity_endpoint": "https://smartnotes-ai.ru/api/agent/identity",
          "claim_endpoint": "https://smartnotes-ai.ru/api/agent/claim",
          "claim_uri": "https://smartnotes-ai.ru/api/agent/claim",
          "events_endpoint": "https://smartnotes-ai.ru/api/agent/event",
          "identity_types_supported": ["anonymous", "identity_assertion", "service_auth"],
          "credential_types_supported": ["bearer"],
          "anonymous": {
            "credential_types_supported": ["bearer"],
            "claim_uri": "https://smartnotes-ai.ru/api/agent/claim"
          },
          "identity_assertion": {
            "assertion_types_supported": [
              "urn:ietf:params:oauth:token-type:id-jag",
              "verified_email"
            ],
            "credential_types_supported": ["bearer"],
            "claim_uri": "https://smartnotes-ai.ru/api/agent/claim"
          },
          "events_supported": [
            "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked"
          ]
        }
      }, null, 2));
    }

    // 4. SmartNotes: smartnotes-ai.ru и остальные хосты
    return handleNext(req, res);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`✅ [Multi-Site] Multi-Site Server listening on port ${port}`);
    console.log(`   - SmartNotes AI: smartnotes-ai.ru`);
    console.log(`   - OBD2 SCAN AI: obd2scanai.ru`);
    console.log(`   - AutoMechanic AI: automechanic.obd2scanai.ru`);
  });
}).catch((err) => {
  console.error('[Multi-Site] Error starting server:', err);
  process.exit(1);
});
