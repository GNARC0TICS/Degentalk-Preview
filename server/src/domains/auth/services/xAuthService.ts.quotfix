import { userService } from '@core/services/user.service';
import type { Request, Response, NextFunction } from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { db } from '@core/db';
import { users } from '@schema/user/users';
import { eq } from 'drizzle-orm';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from "@core/utils/transformer.helpers";

// Environment variables required
const { X_CLIENT_ID, X_CLIENT_SECRET, X_CALLBACK_URL } = process.env as Record<string, string>;

function ensureXEnv() {
	if (!X_CLIENT_ID || !X_CLIENT_SECRET || !X_CALLBACK_URL) {
		throw new Error(
			'Missing X (Twitter) OAuth env vars: X_CLIENT_ID, X_CLIENT_SECRET, X_CALLBACK_URL'
		);
	}
}

// Twitter OAuth2 client (PKCE) – lazily initialised so dev builds without env vars don't crash
let twitterClient: TwitterApi | null = null;

function getTwitterClient() {
	if (!twitterClient) {
		ensureXEnv();
		twitterClient = new TwitterApi({
			clientId: X_CLIENT_ID!,
			clientSecret: X_CLIENT_SECRET!
		});
	}
	return twitterClient;
}

export async function initiateXLogin(req: Request, res: Response, next: NextFunction) {
	try {
		const client = getTwitterClient();
		const { url, codeVerifier, state } = client.generateOAuth2AuthLink(X_CALLBACK_URL!, {
			scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
		});

		// Store verifier & state in session to verify later
		req.session!.x_oauth = { codeVerifier, state };

		return res.redirect(url);
	} catch (err) {
		return next(err);
	}
}

export async function handleXCallback(req: Request, res: Response, next: NextFunction) {
	try {
		const { state, code } = req.query as Record<string, string>;
		const sessionData = req.session!.x_oauth;
		if (!sessionData || state !== sessionData.state) {
			return sendErrorResponse(res, 'Invalid OAuth state', 400);
		}

		const client = getTwitterClient();
		const {
			client: loggedClient,
			accessToken,
			refreshToken,
			expiresIn
		} = await client.loginWithOAuth2({
			code,
			codeVerifier: sessionData.codeVerifier,
			redirectUri: X_CALLBACK_URL
		});

		const twitterUser = await loggedClient.v2.me();
		const xAccountId = twitterUser.data.id;
		const xLinkedAt = new Date();
		const xTokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

		// If user is logged in, link account; else create user
		if (userService.getUserFromRequest(req)) {
			await db
				.update(users)
				.set({
					xAccountId,
					xAccessToken: accessToken,
					xRefreshToken: refreshToken,
					xTokenExpiresAt,
					xLinkedAt
				})
				.where(eq(users.id, (userService.getUserFromRequest(req) as any).id));

			return res.redirect('/profile/settings?linked=x');
		}

		// No session user -> sign up / login via X
		// Try to find existing user with this xAccountId
		const existing = await db.query.users.findFirst({ where: eq(users.xAccountId, xAccountId) });
		if (existing) {
			// TODO: establish session for existing user
			req.login(existing as any, (err) => {
				if (err) return next(err);
				return res.redirect('/');
			});
			return;
		}

		// Create new user
		const newUsername = `x_${twitterUser.data.username}`;
		const [inserted] = await db
			.insert(users)
			.values({
				xAccountId,
				xAccessToken: accessToken,
				xRefreshToken: refreshToken,
				xTokenExpiresAt,
				xLinkedAt,
				username: newUsername,
				email: `${newUsername}@example.com`,
				password: '<oauth>' // placeholder; oauth users login via X
			})
			.returning();

		// Log the user in
		req.login(inserted as any, (err) => {
			if (err) return next(err);
			return res.redirect('/');
		});
	} catch (err) {
		logger.error('XAuthService', 'Callback failed', { err });
		return next(err);
	}
}

export async function unlinkXAccount(req: Request, res: Response, next: NextFunction) {
	try {
		if (!userService.getUserFromRequest(req))
			return sendErrorResponse(res, 'Not logged in', 401);
		await db
			.update(users)
			.set({
				xAccountId: null,
				xAccessToken: null,
				xRefreshToken: null,
				xTokenExpiresAt: null,
				xLinkedAt: null
			})
			.where(eq(users.id, (userService.getUserFromRequest(req) as any).id));

		sendSuccessResponse(res, { success: true });
	} catch (err) {
		return next(err);
	}
}
