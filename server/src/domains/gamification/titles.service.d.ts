import type { CreateTitleInput, UpdateTitleInput } from './titles.validators';
import type { TitleId, UserId } from '@shared/types/ids';
import type { Title, UserTitle } from '@shared/types/entities/title.types';
export declare class TitlesService {
    list(): Promise<any>;
    getByRole(roleId: string): Promise<any>;
    getCustomTitles(): Promise<any>;
    getTitleById(id: TitleId): Promise<Title | null>;
    getUserTitles(userId: UserId): Promise<UserTitle[]>;
    grantTitle(userId: UserId, titleId: TitleId, reason?: string, grantedBy?: UserId): Promise<void>;
    revokeTitle(userId: UserId, titleId: TitleId, reason?: string, revokedBy?: UserId): Promise<void>;
    equipTitle(userId: UserId, titleId: TitleId): Promise<void>;
    unequipTitle(userId: UserId): Promise<void>;
    checkAndGrantLevelTitles(userId: UserId, newLevel: number): Promise<TitleId[]>;
    checkAndGrantRoleTitles(userId: UserId, roleId: string): Promise<TitleId[]>;
    create(data: CreateTitleInput): Promise<any>;
    update(id: TitleId, data: UpdateTitleInput): Promise<any>;
    delete(id: TitleId): Promise<{
        success: boolean;
    }>;
}
