import { pgTable, text, timestamp, boolean, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

// ─── Better Auth Tables ────────────────────────────────────
export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id),
});

export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Posts ──────────────────────────────────────────────────
export const posts = pgTable('posts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    content: text('content').notNull(),
    platform: text('platform').notNull(), // facebook, instagram, linkedin, twitter
    status: text('status').notNull().default('draft'), // draft, scheduled, published
    scheduledAt: timestamp('scheduled_at'),
    publishedAt: timestamp('published_at'),
    imageUrl: text('image_url'),
    hashtags: text('hashtags'), // comma-separated
    tonality: text('tonality'), // professional, friendly, informative, inspiring, humorous
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Media Library ──────────────────────────────────────────
export const media = pgTable('media', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    fileName: text('file_name').notNull(),
    fileUrl: text('file_url').notNull(),
    fileType: text('file_type').notNull(), // image/png, image/jpeg, image/webp
    fileSize: integer('file_size'),
    tags: text('tags'), // comma-separated
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Brand Settings ─────────────────────────────────────────
export const brands = pgTable('brands', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id).unique(),
    companyName: text('company_name'),
    logoUrl: text('logo_url'),
    primaryColor: text('primary_color').default('#3B82F6'),
    secondaryColor: text('secondary_color').default('#1E40AF'),
    accentColor: text('accent_color').default('#60A5FA'),
    font: text('font').default('Satoshi'),
    toneOfVoice: text('tone_of_voice'), // description for AI
    industry: text('industry'),
    targetAudience: text('target_audience'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── User Settings (API Keys etc.) ──────────────────────────
export const userSettings = pgTable('user_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id).unique(),
    geminiApiKey: text('gemini_api_key'), // encrypted
    nanoBananaApiKey: text('nano_banana_api_key'), // encrypted
    defaultPlatform: text('default_platform').default('instagram'),
    defaultTonality: text('default_tonality').default('professional'),
    language: text('language').default('de'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Social Media Accounts ──────────────────────────────────
export const socialAccounts = pgTable('social_accounts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    platform: text('platform').notNull(), // facebook, instagram, linkedin, twitter
    accountName: text('account_name').notNull(),
    accountHandle: text('account_handle'),
    profileImageUrl: text('profile_image_url'),
    accessToken: text('access_token'), // encrypted
    refreshToken: text('refresh_token'),
    tokenExpiresAt: timestamp('token_expires_at'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Templates ──────────────────────────────────────────────
export const templates = pgTable('templates', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => user.id), // null = system template
    title: text('title').notNull(),
    content: text('content').notNull(),
    category: text('category').notNull(), // announcement, product_launch, faq, testimonial, behind_the_scenes
    platform: text('platform'), // null = all platforms
    industry: text('industry'),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
