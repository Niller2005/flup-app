import { sql } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	twitchId: int('twitch_id', { mode: 'number' }).notNull().unique(),
	username: text('username').notNull().unique(),
	displayName: text('display_name').notNull(),
	profileImageUrl: text('profile_image_url'),
	email: text('email').unique(),
	createdAt: int('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`)
});

export const sessions = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: int('expires_at').notNull()
});
