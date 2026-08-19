import { prisma } from "./prisma";

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const USERINFO_URL = "https://api.linkedin.com/v2/userinfo";
const REST_BASE = "https://api.linkedin.com/rest";

export const PERSONAL_SCOPES = ["openid", "profile", "email", "w_member_social"];
export const ORG_SCOPES = ["w_organization_social", "r_organization_social"];

export function currentLinkedInVersion() {
  const now = new Date();
  return `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function normalizeLinkedInVersion(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8) return digits.slice(0, 6);
  if (digits.length === 6) return digits;
  return currentLinkedInVersion();
}

export function getLinkedInConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID ?? "";
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET ?? "";
  const redirectUri =
    process.env.LINKEDIN_REDIRECT_URI ?? "http://localhost:3000/api/auth/linkedin/callback";
  const apiVersion = normalizeLinkedInVersion(
    process.env.LINKEDIN_API_VERSION || currentLinkedInVersion(),
  );
  return { clientId, clientSecret, redirectUri, apiVersion };
}

export function buildAuthUrl(state: string, includeOrg: boolean) {
  const { clientId, redirectUri } = getLinkedInConfig();
  const scopes = includeOrg ? [...PERSONAL_SCOPES, ...ORG_SCOPES] : PERSONAL_SCOPES;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: scopes.join(" "),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const { clientId, clientSecret, redirectUri } = getLinkedInConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || "Token exchange failed");
  }
  return json as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = getLinkedInConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    error_description?: string;
    error?: string;
  };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || "Token refresh failed");
  }
  return json as { access_token: string; expires_in: number; refresh_token?: string };
}

export async function fetchUserInfo(accessToken: string) {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = (await res.json()) as {
    sub?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    email?: string;
    locale?: { country?: string; language?: string };
  };
  if (!res.ok || !json.sub) {
    throw new Error("Failed to load LinkedIn profile");
  }
  return json;
}

export async function fetchMemberExtras(accessToken: string) {
  const res = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return { headline: "" };
  const json = (await res.json()) as {
    localizedHeadline?: string;
    headline?: { localized?: Record<string, string> };
  };
  const headline =
    json.localizedHeadline ||
    (json.headline?.localized ? Object.values(json.headline.localized)[0] : "") ||
    "";
  return { headline };
}

export async function getValidAccessToken(userId: string) {
  const account = await prisma.linkedInAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Connect LinkedIn first");

  const bufferMs = 5 * 60 * 1000;
  if (account.tokenExpiresAt.getTime() - Date.now() > bufferMs) {
    return { token: account.accessToken, account };
  }

  if (!account.refreshToken) {
    throw new Error("LinkedIn session expired. Reconnect your account.");
  }

  const refreshed = await refreshAccessToken(account.refreshToken);
  const expiresAt = new Date(Date.now() + (refreshed.expires_in ?? 3600) * 1000);
  const updated = await prisma.linkedInAccount.update({
    where: { userId },
    data: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token || account.refreshToken,
      tokenExpiresAt: expiresAt,
    },
  });
  return { token: updated.accessToken, account: updated };
}

export function restHeaders(accessToken: string, extra?: Record<string, string>, version?: string) {
  const { apiVersion } = getLinkedInConfig();
  return {
    Authorization: `Bearer ${accessToken}`,
    "Linkedin-Version": version || apiVersion,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function linkedInRest(
  path: string,
  init: RequestInit & { accessToken: string },
) {
  const { accessToken, headers, ...rest } = init;
  const versions = [getLinkedInConfig().apiVersion, currentLinkedInVersion(), "202607", "202601"];
  const unique = [...new Set(versions)];
  let last = { ok: false, status: 0, json: null as unknown, headers: new Headers(), text: "" };

  for (const version of unique) {
    const res = await fetch(`${REST_BASE}${path}`, {
      ...rest,
      headers: restHeaders(accessToken, headers as Record<string, string> | undefined, version),
    });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text };
    }
    last = { ok: res.ok, status: res.status, json, headers: res.headers, text };
    if (res.ok) return last;
    const msg = `${text} ${extractLinkedInError(json)}`.toLowerCase();
    if (!msg.includes("not active") && !msg.includes("requested version")) break;
  }
  return last;
}

export async function fetchAdminOrganizations(accessToken: string) {
  const attempts = [
    `${REST_BASE}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED`,
    `https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED`,
  ];

  for (const url of attempts) {
    const res = await fetch(url, {
      headers: restHeaders(accessToken),
    });
    if (!res.ok) continue;
    const json = (await res.json()) as {
      elements?: Array<{
        organization?: string;
        organizationName?: string;
        roleAssignee?: string;
      }>;
    };
    const orgs = json.elements ?? [];
    const detailed = [];
    for (const el of orgs) {
      const urn = el.organization;
      if (!urn) continue;
      const orgId = urn.replace("urn:li:organization:", "");
      let name = el.organizationName || `Page ${orgId}`;
      let logoUrl = "";
      try {
        const orgRes = await fetch(`${REST_BASE}/organizations/${orgId}`, {
          headers: restHeaders(accessToken),
        });
        if (orgRes.ok) {
          const orgJson = (await orgRes.json()) as {
            localizedName?: string;
            name?: string;
            logoV2?: { original?: string };
          };
          name = orgJson.localizedName || orgJson.name || name;
        }
      } catch {
        /* keep fallback name */
      }
      detailed.push({ urn, name, logoUrl });
    }
    if (detailed.length) return detailed;
    if (orgs.length === 0) return [];
  }
  return [];
}

export async function initializeImageUpload(accessToken: string, ownerUrn: string) {
  const result = await linkedInRest("/images?action=initializeUpload", {
    method: "POST",
    accessToken,
    body: JSON.stringify({ initializeUploadRequest: { owner: ownerUrn } }),
  });
  if (!result.ok) {
    throw new Error(extractLinkedInError(result.json) || "Image upload init failed");
  }
  const value = (result.json as { value?: { uploadUrl?: string; image?: string } }).value;
  if (!value?.uploadUrl || !value.image) throw new Error("LinkedIn did not return an upload URL");
  return { uploadUrl: value.uploadUrl, imageUrn: value.image };
}

export async function initializeDocumentUpload(accessToken: string, ownerUrn: string) {
  const result = await linkedInRest("/documents?action=initializeUpload", {
    method: "POST",
    accessToken,
    body: JSON.stringify({ initializeUploadRequest: { owner: ownerUrn } }),
  });
  if (!result.ok) {
    throw new Error(extractLinkedInError(result.json) || "Document upload init failed");
  }
  const value = (result.json as { value?: { uploadUrl?: string; document?: string } }).value;
  if (!value?.uploadUrl || !value.document) throw new Error("LinkedIn did not return a document URL");
  return { uploadUrl: value.uploadUrl, documentUrn: value.document };
}

export async function putBinary(uploadUrl: string, bytes: Buffer, contentType: string) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: new Uint8Array(bytes),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed (${res.status})`);
  }
}

export async function createPost(
  accessToken: string,
  input: {
    authorUrn: string;
    commentary: string;
    mediaUrn?: string;
    mediaKind?: "image" | "document";
  },
) {
  const payload: Record<string, unknown> = {
    author: input.authorUrn,
    commentary: input.commentary,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };
  if (input.mediaUrn && input.mediaKind === "image") {
    payload.content = { media: { id: input.mediaUrn } };
  }
  if (input.mediaUrn && input.mediaKind === "document") {
    payload.content = { media: { id: input.mediaUrn } };
  }

  const result = await linkedInRest("/posts", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
  if (!result.ok) {
    const ugc = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        author: input.authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: input.commentary },
            shareMediaCategory: input.mediaUrn
              ? input.mediaKind === "document"
                ? "ARTICLE"
                : "IMAGE"
              : "NONE",
            ...(input.mediaUrn
              ? {
                  media: [
                    {
                      status: "READY",
                      media: input.mediaUrn,
                    },
                  ],
                }
              : {}),
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });
    if (ugc.ok) {
      return ugc.headers.get("x-restli-id") || ugc.headers.get("x-linkedin-id") || "";
    }
    const ugcText = await ugc.text();
    throw new Error(
      extractLinkedInError(result.json) || ugcText || `Publish failed (${result.status})`,
    );
  }
  const postUrn =
    result.headers.get("x-restli-id") ||
    result.headers.get("x-linkedin-id") ||
    (typeof result.json === "object" && result.json && "id" in result.json
      ? String((result.json as { id: string }).id)
      : "");
  return postUrn;
}

export async function createComment(
  accessToken: string,
  postUrn: string,
  text: string,
  actorUrn: string,
) {
  const encodedUrn = encodeURIComponent(postUrn);
  const payload = {
    actor: actorUrn,
    object: postUrn,
    message: { text },
  };
  const result = await linkedInRest(`/socialActions/${encodedUrn}/comments`, {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
  if (!result.ok) {
    const fallback = await fetch(
      `https://api.linkedin.com/v2/socialActions/${encodedUrn}/comments`,
      {
        method: "POST",
        headers: restHeaders(accessToken),
        body: JSON.stringify(payload),
      },
    );
    if (!fallback.ok) {
      const err = await fallback.text();
      throw new Error(extractLinkedInError(result.json) || err || "First comment failed");
    }
  }
}

export function extractLinkedInError(json: unknown) {
  if (!json || typeof json !== "object") return "";
  const obj = json as Record<string, unknown>;
  if (typeof obj.message === "string") return obj.message;
  if (typeof obj.error === "string") return obj.error;
  if (typeof obj.error_description === "string") return obj.error_description;
  const status = obj.status as { message?: string } | undefined;
  if (status?.message) return status.message;
  try {
    return JSON.stringify(json);
  } catch {
    return "";
  }
}
