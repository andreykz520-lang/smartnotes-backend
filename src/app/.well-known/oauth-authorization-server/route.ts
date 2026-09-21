import { NextResponse } from 'next/server';

export async function GET() {
  const metadata = {
    issuer: "https://smartnotes-ai.ru",
    authorization_endpoint: "https://smartnotes-ai.ru/auth/authorize",
    token_endpoint: "https://smartnotes-ai.ru/api/auth/token",
    revocation_endpoint: "https://smartnotes-ai.ru/api/auth/revoke",
    jwks_uri: "https://smartnotes-ai.ru/.well-known/jwks.json",
    response_types_supported: ["code", "token"],
    grant_types_supported: [
      "authorization_code",
      "client_credentials",
      "urn:ietf:params:oauth:grant-type:jwt-bearer",
      "urn:workos:agent-auth:grant-type:claim"
    ],
    scopes_supported: [
      "notes:read",
      "notes:write"
    ],
    bearer_methods_supported: [
      "header"
    ],
    agent_auth: {
      skill: "https://smartnotes-ai.ru/auth.md",
      register_uri: "https://smartnotes-ai.ru/api/agent/register",
      identity_endpoint: "https://smartnotes-ai.ru/api/agent/identity",
      claim_endpoint: "https://smartnotes-ai.ru/api/agent/claim",
      claim_uri: "https://smartnotes-ai.ru/api/agent/claim",
      events_endpoint: "https://smartnotes-ai.ru/api/agent/event",
      identity_types_supported: [
        "anonymous",
        "identity_assertion",
        "service_auth"
      ],
      credential_types_supported: [
        "bearer"
      ],
      anonymous: {
        credential_types_supported: [
          "bearer"
        ],
        claim_uri: "https://smartnotes-ai.ru/api/agent/claim"
      },
      identity_assertion: {
        assertion_types_supported: [
          "urn:ietf:params:oauth:token-type:id-jag",
          "verified_email"
        ],
        credential_types_supported: [
          "bearer"
        ],
        claim_uri: "https://smartnotes-ai.ru/api/agent/claim"
      },
      events_supported: [
        "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked"
      ]
    }
  };

  return new NextResponse(JSON.stringify(metadata, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
