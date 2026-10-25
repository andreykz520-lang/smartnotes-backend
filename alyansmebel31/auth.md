# auth.md — Альянс Мебель (Пинскдрев Белгород) AI Agent Registration

## Agent Registration and Authentication

«Альянс Мебель» provides programmatic discovery and automated interaction endpoints for AI agents, crawlers, and LLM-driven shopping/consultation tools.

### Audience
Autonomous AI agents, search engines, shopping assistants, and programmatic clients discovering Belarusian solid-oak and upholstered furniture in Belgorod.

### Agent Registration Endpoint
Autonomous agents can register and obtain credentials via:
- Endpoint: `https://alyansmebel31.ru/api/agent/register`
- Protocol: OAuth 2.0 Dynamic Client Registration / Agent Registration
- Claim URI: `https://alyansmebel31.ru/api/agent/claim`

### Supported Authentication & Credential Types
- **Anonymous Access:** Open discovery documents, API catalog, sitemap, and catalog syllabus are available without credentials.
- **Bearer Tokens:** Pass Bearer token via HTTP Header: `Authorization: Bearer <token>`.
- **Identity Assertions:** Supports verified email assertions and RFC-compliant ID-JAG tokens (`urn:ietf:params:oauth:token-type:id-jag`).

### Discovery & Service Metadata
- Documentation: https://alyansmebel31.ru/llms.txt
- Service Catalog (RFC 9727): https://alyansmebel31.ru/.well-known/api-catalog
- Protected Resource Metadata (RFC 9728): https://alyansmebel31.ru/.well-known/oauth-protected-resource
- Authorization Server: https://alyansmebel31.ru/.well-known/oauth-authorization-server
- MCP Server Card (SEP-1649): https://alyansmebel31.ru/.well-known/mcp/server-card.json
- Agent Skills Index: https://alyansmebel31.ru/.well-known/agent-skills/index.json
