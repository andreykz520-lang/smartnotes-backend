# auth.md - Remont AKPP Belgorod Agent Registration

## Agent Registration and Authentication

СТО Ремонт АКПП Белгород (ул. Серафимовича, 75) provides automated service discovery and lead/booking endpoints for AI diagnostic agents, automotive concierges, and vehicle assistants.

### Audience
Autonomous AI agents, vehicle diagnostic copilots, and local service search crawlers scheduling auto repairs in Belgorod.

### Endpoints
- Service Root: `https://remont-akpp31.ru/`
- Lead Submission: `https://remont-akpp31.ru/api/lead`
- Health: `https://remont-akpp31.ru/api/health`
- Agent Registration: `https://remont-akpp31.ru/api/agent/register`
- Claim URI: `https://remont-akpp31.ru/api/agent/claim`

### Supported Authentication
- **Anonymous:** Public service discovery, repair guides, and online booking.
- **Bearer:** Bearer tokens for authorized diagnostic partners.
- **Identity Assertions:** Verified email and RFC-compliant ID-JAG tokens (`urn:ietf:params:oauth:token-type:id-jag`).

### Discovery Documents
- Documentation: https://remont-akpp31.ru/llms.txt
- Service Catalog: https://remont-akpp31.ru/.well-known/api-catalog
- AI Catalog: https://remont-akpp31.ru/.well-known/ai-catalog.json
- Protected Resource Metadata: https://remont-akpp31.ru/.well-known/oauth-protected-resource
- Authorization Server: https://remont-akpp31.ru/.well-known/oauth-authorization-server
