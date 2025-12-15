import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from "@simplewebauthn/server";

import { webauthnStore } from "../stores/webauthn.store.js";
import { RP_NAME, RP_ID, ORIGIN } from "../config.js";

const challengeStore = new Map(); // ephemeral

/* =========================
   REGISTRATION
   ========================= */

export function beginRegistration(user) {
  const options = generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: user.id,
    userName: user.email,
    userDisplayName: user.name,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred"
    }
  });

  challengeStore.set(user.id, options.challenge);
  return options;
}

export async function finishRegistration(user, response) {
  const expectedChallenge = challengeStore.get(user.id);

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID
  });

  if (!verification.verified) {
    throw new Error("WebAuthn registration failed");
  }

  const { credentialID, credentialPublicKey, counter } =
    verification.registrationInfo;

  webauthnStore.set(Buffer.from(credentialID).toString("base64url"), {
    publicKey: credentialPublicKey,
    counter,
    userId: user.id
  });

  challengeStore.delete(user.id);
}

/* =========================
   AUTHENTICATION
   ========================= */

export function beginAuthentication(userId) {
  const allowCredentials = [];

  for (const [credId, record] of webauthnStore.entries()) {
    if (record.userId === userId) {
      allowCredentials.push({
        id: Buffer.from(credId, "base64url"),
        type: "public-key"
      });
    }
  }

  const options = generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials,
    userVerification: "preferred"
  });

  challengeStore.set(userId, options.challenge);
  return options;
}

export async function finishAuthentication(userId, response) {
  const expectedChallenge = challengeStore.get(userId);

  const credId = Buffer.from(response.rawId, "base64").toString("base64url");
  const authenticator = webauthnStore.get(credId);

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    authenticator
  });

  if (!verification.verified) {
    throw new Error("WebAuthn authentication failed");
  }

  authenticator.counter = verification.authenticationInfo.newCounter;
  challengeStore.delete(userId);
}
