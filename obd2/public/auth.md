# auth.md - OBD2 SCAN AI Agent Registration

## Agent Registration and Authentication

OBD2 SCAN AI provides direct programmatic access and discovery for AI agents, diagnostic scanners, and automotive assistants.

### Audience
This document is intended for autonomous AI agents, crawlers, and LLM-driven diagnostic tools interacting with OBD2 SCAN AI APIs.

### Agent Registration Endpoint
Autonomous agents can register and obtain credentials via:
- Endpoint: `https://obd2scanai.ru/api/agent/register`
- Protocol: OAuth 2.0 Dynamic Client Registration / Agent Registration
- Claim URI: `https://obd2scanai.ru/api/agent/claim`

### Supported Authentication & Credential Types
- **Anonymous Access:** Open discovery documents, API catalog, and vehicle troubleshooting guidelines are available without credentials.
- **Bearer Tokens:** Pass Bearer token via HTTP Header: `Authorization: Bearer <token>`.
- **Identity Assertions:** Supports verified email assertions and RFC-compliant ID-JAG tokens (`urn:ietf:params:oauth:token-type:id-jag`).

### Discovery & Service Metadata
- Documentation: https://obd2scanai.ru/llms.txt
- Service Catalog: https://obd2scanai.ru/.well-known/api-catalog
- Protected Resource Metadata (RFC 9728): https://obd2scanai.ru/.well-known/oauth-protected-resource
- Authorization Server: https://obd2scanai.ru/.well-known/oauth-authorization-server
