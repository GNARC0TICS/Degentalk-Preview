import { db } from '@db'; // Adjust path to your db instance
import { products } from '@schema'; // Adjust path to your schema
import { eq, desc, and } from 'drizzle-orm';
import { ShopTransformer } from '@server/domains/shop/transformers/shop.transformer';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

export const shopAdminController = {
	// List all products
	async listProducts(req, res) {
		// TODO: Add pagination, filtering, sorting
		const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));

		// Transform products for admin view
		const transformedProducts = allProducts.map((product) =>
			ShopTransformer.toAdminShopItem(product)
		);

		sendSuccessResponse(res, transformedProducts);
	},

	// Create a new product
	async createProduct(req, res) {
		const {
			name,
			description,
			priceDGT,
			priceUSDT,
			category,
			rarity,
			imageUrl,
			pluginReward,
			stockLimit,
			pointsPrice,
			effectType
		} = req.body;
		// Basic validation (you'll want more robust validation, e.g., Zod)
		if (!name || typeof priceDGT === 'undefined') {
			return sendErrorResponse(res, 'Name and DGT Price are required.', 400);
		}

		try {
			const newProduct = await db
				.insert(products)
				.values({
					name,
					slug: name.toLowerCase().replace(/\s+/g, '-'), // Auto-generate slug
					description,
					price: priceDGT, // Assuming priceDGT maps to the main 'price' field for DGT currency
					// priceUSDT: priceUSDT, // Need a separate column or store in metadata if using multiple real currencies
					pointsPrice: pointsPrice || priceDGT, // Or however you map DGT to pointsPrice
					category, // This should map to a categoryId if using productCategories table
					// rarity, // Rarity isn't directly in products schema, store in metadata or pluginReward
					// imageUrl, // imageUrl isn't directly in products schema, use productMedia or store in metadata
					pluginReward: pluginReward || {
						type: effectType,
						rarity: rarity,
						imageUrl: imageUrl,
						priceUSDT: priceUSDT
					}, // Consolidate extra fields here
					stock: stockLimit || 0, // Assuming stockLimit is the initial stock
					stockLimit,
					status: 'published' // Default to published, or make it a parameter
				})
				.returning();
			return sendSuccessResponse(res, newProduct[0]);
		} catch (error) {
			logger.error('Error creating product:', error);
			return sendErrorResponse(res, 'Error creating product', 400);
		}
	},

	// Get a single product by ID
	async getProductById(req, res) {
		const { productId } = req.params;
		try {
			const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
			if (product.length === 0) {
				return sendErrorResponse(res, 'Product not found', 404);
			}

			// Transform product for admin view
			const transformedProduct = ShopTransformer.toAdminShopItem(product[0]);

			sendSuccessResponse(res, transformedProduct);
		} catch (error) {
			logger.error('Error fetching product by ID:', error);
			return sendErrorResponse(res, 'Error fetching product by ID', 400);
		}
	},

	// Update an existing product
	async updateProduct(req, res) {
		const { productId } = req.params;
		const updates = req.body;

		if (Object.keys(updates).length === 0) {
			return sendErrorResponse(res, 'No update data provided.', 400);
		}

		try {
			// Ensure pluginReward is an object if provided
			if (updates.pluginReward && typeof updates.pluginReward === 'string') {
				try {
					updates.pluginReward = JSON.parse(updates.pluginReward);
				} catch (e) {
					return sendErrorResponse(res, 'Invalid pluginReward JSON format.', 400);
				}
			}
			if (updates.name && !updates.slug) {
				updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-');
			}

			const updatedProduct = await db
				.update(products)
				.set({ ...updates, updatedAt: new Date() })
				.where(eq(products.id, productId))
				.returning();

			if (updatedProduct.length === 0) {
				return sendErrorResponse(res, 'Product not found', 404);
			}
			// Transform updated product for admin view
			const transformedProduct = ShopTransformer.toAdminShopItem(updatedProduct[0]);

			sendSuccessResponse(res, transformedProduct);
		} catch (error) {
			logger.error('Error updating product:', error);
			return sendErrorResponse(res, 'Error updating product', 400);
		}
	},

	// Soft delete a product (mark as isDeleted or change status to archived)
	async deleteProduct(req, res) {
		const { productId } = req.params;
		try {
			const deletedProduct = await db
				.update(products)
				.set({ isDeleted: true, status: 'archived', deletedAt: new Date() })
				.where(eq(products.id, productId))
				.returning();

			if (deletedProduct.length === 0) {
				return sendErrorResponse(res, 'Product not found', 404);
			}
			return sendSuccessResponse(res, {
				message: 'Product archived successfully',
				product: deletedProduct[0]
			});
		} catch (error) {
			logger.error('Error deleting product:', error);
			return sendErrorResponse(res, 'Error deleting product', 400);
		}
	}
};
