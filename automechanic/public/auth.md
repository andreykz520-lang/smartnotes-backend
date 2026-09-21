# auth.md - AutoMechanic AI Agent Registration

## Agent Registration and Authentication

AutoMechanic AI provides direct programmatic access and discovery for AI agents, autonomous diagnostic tools, and automotive assistants.

### Audience
This document is intended for autonomous AI agents, crawlers, and LLM-driven diagnostic clients interacting with AutoMechanic AI APIs.

### Agent Registration Endpoint
Autonomous agents can register and obtain credentials via:
- Endpoint: `https://automechanic.obd2scanai.ru/api/agent/register`
- Protocol: OAuth 2.0 Dynamic Client Registration / Agent Registration
- Claim URI: `https://automechanic.obd2scanai.ru/api/agent/claim`

### Supported Authentication & Credential Types
- **Anonymous Access:** Open discovery documents, API catalog, and vehicle troubleshooting guidelines are available without credentials.
- **Bearer Tokens:** Pass Bearer token via HTTP Header: `Authorization: Bearer <token>`.
- **Identity Assertions:** Supports verified email assertions and RFC-compliant ID-JAG tokens (`urn:ietf:params:oauth:token-type:id-jag`).

### Discovery & Service Metadata
- Documentation: https://automechanic.obd2scanai.ru/llms.txt
- Service Catalog: https://automechanic.obd2scanai.ru/.well-known/api-catalog
- Protected Resource Metadata (RFC 9728): https://automechanic.obd2scanai.ru/.well-known/oauth-protected-resource
- Authorization Server: https://automechanic.obd2scanai.ru/.well-known/oauth-authorization-server
