/**
 * Base Repository
 *
 * QUALITY IMPROVEMENT: Repository pattern implementation for consistent data access
 * Provides common CRUD operations with proper error handling and type safety
 */
import { db } from '@degentalk/db';
import { sql, eq, and, count, desc, asc } from 'drizzle-orm';
import { logger } from '../logger';
export class RepositoryError extends Error {
    code;
    statusCode;
    context;
    constructor(message, code, statusCode = 500, context) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.context = context;
        this.name = 'RepositoryError';
    }
}
export class BaseRepository {
    /**
     * Find entity by ID
     */
    async findById(id) {
        try {
            const idColumn = this.getIdColumn();
            const [result] = await db.select().from(this.table).where(eq(idColumn, id)).limit(1);
            return result || null;
        }
        catch (error) {
            logger.error(`${this.entityName}Repository`, 'Error in findById', { id, error });
            throw new RepositoryError(`Failed to find ${this.entityName} by ID`, 'FIND_BY_ID_ERROR', 500, { id, originalError: error });
        }
    }
    /**
     * Find multiple entities with options
     */
    async find(options = {}) {
        try {
            let query = db.select().from(this.table);
            // Apply filters
            if (options.filters) {
                const conditions = this.buildFilterConditions(options.filters);
                if (conditions.length > 0) {
                    query = query.where(and(...conditions));
                }
            }
            // Apply sorting
            if (options.sort && options.sort.length > 0) {
                const orderBy = options.sort.map((sort) => {
                    const column = this.getColumnByName(sort.column);
                    return sort.direction === 'desc' ? desc(column) : asc(column);
                });
                query = query.orderBy(...orderBy);
            }
            // Apply pagination
            if (options.pagination) {
                const { limit = 20, offset } = options.pagination;
                const page = options.pagination.page || 1;
                const actualOffset = offset !== undefined ? offset : (page - 1) * limit;
                query = query.limit(limit).offset(actualOffset);
            }
            const results = await query;
            return results;
        }
        catch (error) {
            logger.error(`${this.entityName}Repository`, 'Error in find', { options, error });
            throw new RepositoryError(`Failed to find ${this.entityName} entities`, 'FIND_ERROR', 500, {
                options,
                originalError: error
            });
        }
    }
    /**
     * Find with pagination
     */
    async findPaginated(options = {}) {
        try {
            const page = options.pagination?.page || 1;
            const limit = Math.min(options.pagination?.limit || 20, 100);
            const offset = (page - 1) * limit;
            // Get total count
            let countQuery = db.select({ count: count() }).from(this.table);
            if (options.filters) {
                const conditions = this.buildFilterConditions(options.filters);
                if (conditions.length > 0) {
                    countQuery = countQuery.where(and(...conditions));
                }
            }
            const [{ count: total }] = await countQuery;
            // Get data
            const data = await this.find({
                ...options,
                pagination: { page, limit, offset }
            });
            const totalPages = Math.ceil(total / limit);
            return {
                data,
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
        }
        catch (error) {
            logger.error(`${this.entityName}Repository`, 'Error in findPaginated', { options, error });
            throw new RepositoryError(`Failed to find paginated ${this.entityName} entities`, 'FIND_PAGINATED_ERROR', 500, { options, originalError: error });
        }
    }
    /**
     * Create new entity
     */
    async create(data) {
        try {
            const [result] = await db.insert(this.table).values(this.prepareCreateData(data)).returning();
            logger.info(`${this.entityName}Repository`, 'Entity created successfully', {
                id: result[this.getIdColumnName()]
            });
            return result;
        }
        catch (error) {
            logger.error(`${this.entityName}Repository`, 'Error in create', { data, error });
            throw new RepositoryError(`Failed to create ${this.entityName}`, 'CREATE_ERROR', 500, {
                data,
                originalError: error
            });
        }
    }
    /**
     * Update entity by ID
     */
    async update(id, data) {
        try {
            const idColumn = this.getIdColumn();
            const [result] = await db
                .update(this.table)
                .set(this.prepareUpdateData(data))
                .where(eq(idColumn, id))
                .returning();
            if (!result) {
                throw new RepositoryError(`${this.entityName} not found`, 'NOT_FOUND', 404, { id });
            }
            logger.info(`${this.entityName}Repository`, 'Entity updated successfully', { id });
            return result;
        }
        catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            logger.error(`${this.entityName}Repository`, 'Error in update', { id, data, error });
            throw new RepositoryError(`Failed to update ${this.entityName}`, 'UPDATE_ERROR', 500, {
                id,
                data,
                originalError: error
            });
        }
    }
    /**
     * Delete entity by ID
     */
    async delete(id) {
        try {
            const idColumn = this.getIdColumn();
            const result = await db.delete(this.table).where(eq(idColumn, id));
            logger.info(`${this.entityName}Repository`, 'Entity deleted successfully', { id });
        }
        catch (error) {
            logger.error(`${this.entityName}Repository`, 'Error in delete', { id, error });
            throw new RepositoryError(`Failed to delete ${this.entityName}`, 'DELETE_ERROR', 500, {
                id,
                originalError: error
            });
        }
    }
    /**
     * Check if entity exists
     */
    async exists(id) {
        try {
            const entity = await this.findById(id);
            return entity !== null;
        }
        catch (error) {
            logger.error(`${this.entityName}Repository`, 'Error in exists', { id, error });
            return false;
        }
    }
    /**
     * Count entities with filters
     */
    async count(filters) {
        try {
            let query = db.select({ count: count() }).from(this.table);
            if (filters) {
                const conditions = this.buildFilterConditions(filters);
                if (conditions.length > 0) {
                    query = query.where(and(...conditions));
                }
            }
            const [{ count: total }] = await query;
            return total;
        }
        catch (error) {
            logger.error(`${this.entityName}Repository`, 'Error in count', { filters, error });
            throw new RepositoryError(`Failed to count ${this.entityName} entities`, 'COUNT_ERROR', 500, {
                filters,
                originalError: error
            });
        }
    }
    /**
     * Get ID column for the table
     */
    getIdColumn() {
        const idColumnName = this.getIdColumnName();
        return this.table[idColumnName];
    }
    /**
     * Get ID column name (can be overridden)
     */
    getIdColumnName() {
        return 'id';
    }
    /**
     * Get column by name
     */
    getColumnByName(name) {
        if (!(name in this.table)) {
            throw new RepositoryError(`Column '${name}' does not exist in ${this.entityName} table`, 'INVALID_COLUMN', 400, { columnName: name });
        }
        return this.table[name];
    }
    /**
     * Build filter conditions from filter options
     */
    buildFilterConditions(filters) {
        const conditions = [];
        for (const [key, value] of Object.entries(filters)) {
            if (value === undefined || value === null) {
                continue;
            }
            try {
                const column = this.getColumnByName(key);
                if (Array.isArray(value)) {
                    // IN condition for arrays
                    conditions.push(sql `${column} = ANY(${value})`);
                }
                else if (typeof value === 'object' && value.operator) {
                    // Complex conditions like { operator: 'gt', value: 10 }
                    conditions.push(this.buildComplexCondition(column, value));
                }
                else {
                    // Simple equality
                    conditions.push(eq(column, value));
                }
            }
            catch (error) {
                logger.warn(`${this.entityName}Repository`, 'Skipping invalid filter', { key, value });
            }
        }
        return conditions;
    }
    /**
     * Build complex filter conditions
     */
    buildComplexCondition(column, condition) {
        const { operator, value } = condition;
        switch (operator) {
            case 'gt':
                return sql `${column} > ${value}`;
            case 'gte':
                return sql `${column} >= ${value}`;
            case 'lt':
                return sql `${column} < ${value}`;
            case 'lte':
                return sql `${column} <= ${value}`;
            case 'ne':
                return sql `${column} != ${value}`;
            case 'like':
                return sql `${column} ILIKE ${`%${value}%`}`;
            case 'in':
                return sql `${column} = ANY(${value})`;
            default:
                return eq(column, value);
        }
    }
    /**
     * Prepare data for creation (can be overridden)
     */
    prepareCreateData(data) {
        return {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Prepare data for update (can be overridden)
     */
    prepareUpdateData(data) {
        return {
            ...data,
            updatedAt: new Date()
        };
    }
}
