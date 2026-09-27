# auth.md - АВТОКОНТЕНТ 2026 AI Agent Registration

## Agent Registration and Authentication

АВТОКОНТЕНТ 2026 provides programmatic discovery and automated interaction endpoints for AI agents, crawlers, and LLM-driven research tools.

### Audience
Autonomous AI agents, search engines, and programmatic clients discovering webinars and educational materials.

### Agent Registration Endpoint
Autonomous agents can register and obtain credentials via:
- Endpoint: `https://kontent.smartnotes-ai.ru/api/agent/register`
- Protocol: OAuth 2.0 Dynamic Client Registration / Agent Registration
- Claim URI: `https://kontent.smartnotes-ai.ru/api/agent/claim`

### Supported Authentication & Credential Types
- **Anonymous Access:** Open discovery documents, API catalog, and webinar syllabus are available without credentials.
- **Bearer Tokens:** Pass Bearer token via HTTP Header: `Authorization: Bearer <token>`.
- **Identity Assertions:** Supports verified email assertions and RFC-compliant ID-JAG tokens (`urn:ietf:params:oauth:token-type:id-jag`).

### Discovery & Service Metadata
- Documentation: https://kontent.smartnotes-ai.ru/llms.txt
- Service Catalog: https://kontent.smartnotes-ai.ru/.well-known/api-catalog
- Protected Resource Metadata (RFC 9728): https://kontent.smartnotes-ai.ru/.well-known/oauth-protected-resource
- Authorization Server: https://kontent.smartnotes-ai.ru/.well-known/oauth-authorization-server
