# auth.md - Alyans Mebel Belgorod Agent Registration

## Agent Registration and Authentication

Альянс Мебель Белгород (ул. Благодатная, 80) provides automated service discovery and lead/booking endpoints for AI shopping agents, interior design copilots, and customer assistants.

### Audience
Autonomous AI agents, shopping copilots, and search crawlers discovering solid wood and upholstered furniture by Pinskdrev in Belgorod.

### Endpoints
- Service Root: `https://alyansmebel31.ru/`
- Lead Submission: `https://alyansmebel31.ru/api/lead`
- Health: `https://alyansmebel31.ru/api/health`
- Agent Registration: `https://alyansmebel31.ru/api/agent/register`
- Claim URI: `https://alyansmebel31.ru/api/agent/claim`

### Supported Authentication
- **Anonymous:** Public service discovery, furniture catalogs, and online booking.
- **Bearer:** Bearer tokens for authorized partner agents.
- **Identity Assertions:** Verified email and RFC-compliant ID-JAG tokens (`urn:ietf:params:oauth:token-type:id-jag`).

### Discovery Documents
- Documentation: https://alyansmebel31.ru/llms.txt
- Service Catalog: https://alyansmebel31.ru/.well-known/api-catalog
- AI Catalog: https://alyansmebel31.ru/.well-known/ai-catalog.json
- Protected Resource Metadata: https://alyansmebel31.ru/.well-known/oauth-protected-resource
- Authorization Server: https://alyansmebel31.ru/.well-known/oauth-authorization-server
