import { TwitterApi } from 'twitter-api-v2';
import { db } from '@server/src/core/db';
import { users } from '@schema/user/users';
import { xShares } from '@schema/user/xShares';
import { eq } from 'drizzle-orm';
import { logger } from '@server/src/core/logger';
import { awardXShareReward } from '../../economy/services/rewardService';

export async function shareToX(opts: {
	userId: number;
	text: string;
	contentType: 'post' | 'thread' | 'referral';
	contentId?: number;
}): Promise<{ tweetUrl: string }> {
	const user = await db.query.users.findFirst({ where: eq(users.id, opts.userId) });
	if (!user || !user.xAccessToken || !user.xRefreshToken) {
		throw new Error('User does not have a linked X account');
	}

	const client = new TwitterApi({
		clientId: process.env.X_CLIENT_ID!,
		clientSecret: process.env.X_CLIENT_SECRET!,
		accessToken: user.xAccessToken,
		refreshToken: user.xRefreshToken,
	});

	// Automatically refresh token if needed
	const refreshed = await client.refreshOAuth2Token(user.xRefreshToken);
	if (refreshed.accessToken !== user.xAccessToken) {
		await db.update(users)
			.set({
				xAccessToken: refreshed.accessToken,
				xRefreshToken: refreshed.refreshToken,
				xTokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
			})
			.where(eq(users.id, opts.userId));
	}

	const { data } = await client.v2.tweet(opts.text);

	await db.insert(xShares).values({
		userId: opts.userId,
		contentType: opts.contentType,
		contentId: opts.contentId ?? null,
		xPostId: data.id,
	});

	// Award rewards (XP/DGT) for sharing
	await awardXShareReward(opts.userId);

	logger.info('XShareService', 'Shared content to X', { userId: opts.userId, tweetId: data.id });

	return { tweetUrl: `https://x.com/${data.id}` };
} 