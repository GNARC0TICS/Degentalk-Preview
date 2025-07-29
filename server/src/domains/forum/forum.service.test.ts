import { forumService } from './forum.service';
import {
	mockUuid,
	mockUserId,
	mockThreadId,
	mockPostId,
	mockMissionId,
	mockAchievementId,
	TEST_UUIDS
} from '@shared/test-utils/mock-uuid';
import { forumCategories } from '@schema';
import { db } from '@degentalk/db';
import { eq } from 'drizzle-orm';

// Mock the logger to prevent actual logging during tests and allow assertions
const mockLoggerWarn = vi.fn();
const mockLoggerError = vi.fn();
vi.mock('@core/logger', () => ({
	logger: {
		info: vi.fn(),
		warn: (...args: any[]) => mockLoggerWarn(...args),
		error: (...args: any[]) => mockLoggerError(...args),
		debug: vi.fn()
	}
}));

// Mock db calls for getCategoriesWithStats to isolate getForumStructure logic
const mockGetCategoriesWithStats = vi.fn();

describe('ForumService - getForumStructure', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// @ts-ignore
		forumService.getCategoriesWithStats = mockGetCategoriesWithStats;
	});

	test('should correctly identify primary zones via pluginData.configZoneType', async () => {
		mockGetCategoriesWithStats.mockResolvedValue([
			{
				id: mockUuid(),
				name: 'Primary Zone 1',
				slug: 'pz1',
				type: 'zone',
				pluginData: { configZoneType: 'primary', features: ['feat1'] },
				parentId: null,
				threadCount: 0,
				postCount: 0,
				isZone: true,
				canonical: true
			},
			{
				id: mockUuid(),
				name: 'General Zone 1',
				slug: 'gz1',
				type: 'zone',
				pluginData: { configZoneType: 'general' },
				parentId: null,
				threadCount: 0,
				postCount: 0,
				isZone: true,
				canonical: true
			},
			{
				id: mockUuid(),
				name: 'Forum In Primary',
				slug: 'fip1',
				type: 'forum',
				pluginData: {},
				parentId: 1,
				threadCount: 5,
				postCount: 10,
				isZone: false,
				canonical: false
			}
		]);

		const structure = await forumService.getForumStructure();

		expect(structure.zones).toHaveLength(2);
		const primaryZone = structure.zones.find((z) => z.slug === 'pz1');
		const generalZone = structure.zones.find((z) => z.slug === 'gz1');

		expect(primaryZone?.isPrimary).toBe(true);
		expect(primaryZone?.features).toEqual(['feat1']);
		expect(generalZone?.isPrimary).toBe(false);
		expect(mockLoggerWarn).not.toHaveBeenCalled();
	});

	test('should default to isPrimary: false and log warning if pluginData is missing configZoneType', async () => {
		mockGetCategoriesWithStats.mockResolvedValue([
			{
				id: mockUuid(),
				name: 'Zone Missing Type',
				slug: 'zmt',
				type: 'zone',
				pluginData: { someOtherKey: 'value' },
				parentId: null,
				threadCount: 0,
				postCount: 0,
				isZone: true,
				canonical: true
			}
		]);

		const structure = await forumService.getForumStructure();
		expect(structure.zones[0]?.isPrimary).toBe(false);
		expect(mockLoggerWarn).toHaveBeenCalledWith(
			'ForumService',
			'Missing configZoneType in pluginData',
			expect.anything()
		);
	});

	test('should default to isPrimary: false and log warning if pluginData is null', async () => {
		mockGetCategoriesWithStats.mockResolvedValue([
			{
				id: mockUuid(),
				name: 'Zone Null PluginData',
				slug: 'znpd',
				type: 'zone',
				pluginData: null,
				parentId: null,
				threadCount: 0,
				postCount: 0,
				isZone: true,
				canonical: true
			}
		]);

		const structure = await forumService.getForumStructure();
		expect(structure.zones[0]?.isPrimary).toBe(false);
		expect(mockLoggerWarn).toHaveBeenCalledWith(
			'ForumService',
			'Missing or null pluginData for zone',
			expect.anything()
		);
	});

	test('should default to isPrimary: false and log warning if pluginData.configZoneType is malformed', async () => {
		mockGetCategoriesWithStats.mockResolvedValue([
			{
				id: mockUuid(),
				name: 'Zone Malformed Type',
				slug: 'zmtp',
				type: 'zone',
				pluginData: { configZoneType: 'super_primary_ultra' },
				parentId: null,
				threadCount: 0,
				postCount: 0,
				isZone: true,
				canonical: true
			}
		]);

		const structure = await forumService.getForumStructure();
		expect(structure.zones[0]?.isPrimary).toBe(false);
		expect(mockLoggerWarn).toHaveBeenCalledWith(
			'ForumService',
			'Malformed configZoneType in pluginData',
			expect.anything()
		);
	});

	test('should correctly parse features, customComponents, and staffOnly from pluginData', async () => {
		mockGetCategoriesWithStats.mockResolvedValue([
			{
				id: mockUuid(),
				name: 'Full Zone',
				slug: 'fz1',
				type: 'zone',
				pluginData: {
					configZoneType: 'primary',
					features: ['quests', 'shop'],
					customComponents: ['SpecialWidget'],
					staffOnly: true
				},
				parentId: null,
				threadCount: 0,
				postCount: 0,
				isZone: true,
				canonical: true
			},
			{
				id: mockUuid(),
				name: 'Minimal Zone',
				slug: 'mz1',
				type: 'zone',
				pluginData: {
					configZoneType: 'general'
				},
				parentId: null,
				threadCount: 0,
				postCount: 0,
				isZone: true,
				canonical: true
			}
		]);

		const structure = await forumService.getForumStructure();
		const fullZone = structure.zones.find((z) => z.slug === 'fz1');
		const minimalZone = structure.zones.find((z) => z.slug === 'mz1');

		expect(fullZone?.isPrimary).toBe(true);
		expect(fullZone?.features).toEqual(['quests', 'shop']);
		expect(fullZone?.customComponents).toEqual(['SpecialWidget']);
		expect(fullZone?.staffOnly).toBe(true);

		expect(minimalZone?.isPrimary).toBe(false);
		expect(minimalZone?.features).toEqual([]);
		expect(minimalZone?.customComponents).toEqual([]);
		expect(minimalZone?.staffOnly).toBe(false);
	});

	test('should handle empty pluginData object for a zone', async () => {
		mockGetCategoriesWithStats.mockResolvedValue([
			{
				id: mockUuid(),
				name: 'Empty Plugin Zone',
				slug: 'epz',
				type: 'zone',
				pluginData: {},
				parentId: null,
				threadCount: 0,
				postCount: 0,
				isZone: true,
				canonical: true
			}
		]);

		const structure = await forumService.getForumStructure();
		const zone = structure.zones.find((z) => z.slug === 'epz');

		expect(zone?.isPrimary).toBe(false); // Defaults to 'general'
		expect(zone?.features).toEqual([]);
		expect(zone?.customComponents).toEqual([]);
		expect(zone?.staffOnly).toBe(false);
		expect(mockLoggerWarn).toHaveBeenCalledWith(
			'ForumService',
			'Missing configZoneType in pluginData',
			expect.anything()
		);
	});
});
