import { db } from '@db'; // Adjust path to your db instance
import { products } from '@schema'; // Adjust path to your schema
import { eq, desc, and } from 'drizzle-orm';

export const shopAdminController = {
	// List all products
	async listProducts(req, res) {
		// TODO: Add pagination, filtering, sorting
		const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
		res.json(allProducts);
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
			return res.status(400).json({ message: 'Name and DGT Price are required.' });
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
			res.status(201).json(newProduct[0]);
		} catch (error) {
			console.error('Error creating product:', error);
			res.status(500).json({ message: 'Error creating product', error: error.message });
		}
	},

	// Get a single product by ID
	async getProductById(req, res) {
		const { productId } = req.params;
		try {
			const product = await db
				.select()
				.from(products)
				.where(eq(products.id, parseInt(productId)))
				.limit(1);
			if (product.length === 0) {
				return res.status(404).json({ message: 'Product not found' });
			}
			res.json(product[0]);
		} catch (error) {
			console.error('Error fetching product by ID:', error);
			res.status(500).json({ message: 'Error fetching product by ID', error: error.message });
		}
	},

	// Update an existing product
	async updateProduct(req, res) {
		const { productId } = req.params;
		const updates = req.body;

		if (Object.keys(updates).length === 0) {
			return res.status(400).json({ message: 'No update data provided.' });
		}

		try {
			// Ensure pluginReward is an object if provided
			if (updates.pluginReward && typeof updates.pluginReward === 'string') {
				try {
					updates.pluginReward = JSON.parse(updates.pluginReward);
				} catch (e) {
					return res.status(400).json({ message: 'Invalid pluginReward JSON format.' });
				}
			}
			if (updates.name && !updates.slug) {
				updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-');
			}

			const updatedProduct = await db
				.update(products)
				.set({ ...updates, updatedAt: new Date() })
				.where(eq(products.id, parseInt(productId)))
				.returning();

			if (updatedProduct.length === 0) {
				return res.status(404).json({ message: 'Product not found' });
			}
			res.json(updatedProduct[0]);
		} catch (error) {
			console.error('Error updating product:', error);
			res.status(500).json({ message: 'Error updating product', error: error.message });
		}
	},

	// Soft delete a product (mark as isDeleted or change status to archived)
	async deleteProduct(req, res) {
		const { productId } = req.params;
		try {
			const deletedProduct = await db
				.update(products)
				.set({ isDeleted: true, status: 'archived', deletedAt: new Date() })
				.where(eq(products.id, parseInt(productId)))
				.returning();

			if (deletedProduct.length === 0) {
				return res.status(404).json({ message: 'Product not found' });
			}
			res
				.status(200)
				.json({ message: 'Product archived successfully', product: deletedProduct[0] });
		} catch (error) {
			console.error('Error deleting product:', error);
			res.status(500).json({ message: 'Error deleting product', error: error.message });
		}
	}
};
