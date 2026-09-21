# auth.md - SmartNotes AI Agent Registration

## Agent Registration and Authentication

SmartNotes AI provides direct programmatic access and discovery for AI agents, voice assistants, and productivity tools.

### Audience
This document is intended for autonomous AI agents, crawlers, and LLM-driven note-taking assistants interacting with SmartNotes AI.

### Agent Registration Endpoint
Autonomous agents can register and obtain credentials via:
- Endpoint: `https://smartnotes-ai.ru/api/agent/register`
- Protocol: OAuth 2.0 Dynamic Client Registration / Agent Registration
- Claim URI: `https://smartnotes-ai.ru/api/agent/claim`

### Supported Authentication & Credential Types
- **Anonymous Access:** Open documentation, specifications, and public endpoints are available without credentials.
- **Bearer Tokens:** Pass Bearer token via HTTP Header: `Authorization: Bearer <token>`.
- **Identity Assertions:** Supports verified email assertions and RFC-compliant ID-JAG tokens (`urn:ietf:params:oauth:token-type:id-jag`).

### Discovery & Service Metadata
- Documentation: https://smartnotes-ai.ru/llms.txt
- Service Catalog: https://smartnotes-ai.ru/.well-known/api-catalog
- Protected Resource Metadata (RFC 9728): https://smartnotes-ai.ru/.well-known/oauth-protected-resource
- Authorization Server: https://smartnotes-ai.ru/.well-known/oauth-authorization-server
