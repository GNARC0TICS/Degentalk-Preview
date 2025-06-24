describe('Avatar Frames Purchase & Equip', () => {
	beforeEach(() => {
		// Setup test user with DGT balance
		cy.task('setupTestUser', {
			username: 'test_user',
			dgtBalance: 1000
		});

		// Ensure test avatar frames exist
		cy.task('seedAvatarFrames');

		// Create test thread for validation
		cy.task('createTestThread', { id: 123, title: 'Test Thread' });
	});

	it('should purchase and equip a frame then show it in thread', () => {
		cy.loginAs('test_user');

		// Check initial DGT balance
		cy.visit('/wallet');
		cy.get('[data-testid="dgt-balance"]').should('contain', '1000');

		// Visit shop page
		cy.visit('/shop/avatar-frames');
		cy.wait(1000); // Allow frames to load

		// Find a purchasable frame (not free)
		cy.get('[data-testid="frame-card"]')
			.contains('DGT')
			.parent()
			.within(() => {
				// Store the frame price for later validation
				cy.get('[data-testid="frame-price"]')
					.invoke('text')
					.then((priceText) => {
						const price = parseInt(priceText.replace(/[^\d]/g, ''));

						// Purchase the frame
						cy.get('[data-testid="buy-frame"]').click();

						// Wait for purchase to complete
						cy.get('[data-testid="purchase-success-toast"]')
							.should('be.visible')
							.and('contain', 'Successfully purchased');

						// Verify DGT was deducted
						cy.visit('/wallet');
						cy.get('[data-testid="dgt-balance"]').should('contain', (1000 - price).toString());
					});
			});

		// Go back to shop to equip the frame
		cy.visit('/shop/avatar-frames');

		// Frame should now show "Equip" instead of "Buy"
		cy.get('[data-testid="frame-card"]').contains('Equip').first().click();

		// Verify equip success
		cy.get('[data-testid="equip-success-toast"]').should('be.visible').and('contain', 'equipped');

		// Navigate to thread page to see the frame in action
		cy.visit('/thread/123');
		cy.wait(1000); // Allow thread to load

		// Avatar should have frame styling
		cy.get('[data-testid="user-avatar"]')
			.should('exist')
			.and('have.attr', 'data-frame-equipped', 'true');

		// Check for frame visual effects (depending on rarity)
		cy.get('[data-testid="user-avatar"]').then(($avatar) => {
			// Should have some frame styling class
			const hasFrameClass =
				$avatar.hasClass('ring-yellow-400') ||
				$avatar.hasClass('ring-purple-400') ||
				$avatar.hasClass('ring-blue-400') ||
				$avatar.hasClass('ring-green-400');
			expect(hasFrameClass).to.be.true;
		});
	});

	it('should handle insufficient balance gracefully', () => {
		// Setup user with low balance
		cy.task('setupTestUser', {
			username: 'poor_user',
			dgtBalance: 10
		});

		cy.loginAs('poor_user');
		cy.visit('/shop/avatar-frames');

		// Try to purchase expensive frame
		cy.get('[data-testid="frame-card"]')
			.contains('100') // Assuming there's a 100+ DGT frame
			.parent()
			.within(() => {
				cy.get('[data-testid="buy-frame"]').click();
			});

		// Should show insufficient balance error
		cy.get('[data-testid="error-toast"]')
			.should('be.visible')
			.and('contain', 'Insufficient DGT balance');

		// Balance should remain unchanged
		cy.visit('/wallet');
		cy.get('[data-testid="dgt-balance"]').should('contain', '10');
	});

	it('should prevent purchasing already owned frames', () => {
		cy.loginAs('test_user');

		// Grant frame ownership directly
		cy.task('grantFrameOwnership', {
			userId: 'test_user',
			frameId: 1
		});

		cy.visit('/shop/avatar-frames');

		// Frame should show "Equip" instead of "Buy"
		cy.get('[data-testid="frame-card"]')
			.first()
			.within(() => {
				cy.get('[data-testid="equip-frame"]').should('exist');
				cy.get('[data-testid="buy-frame"]').should('not.exist');
			});
	});

	it('should award XP when equipping frame', () => {
		cy.loginAs('test_user');

		// Check initial XP
		cy.visit('/profile');
		cy.get('[data-testid="user-xp"]')
			.invoke('text')
			.then((initialXP) => {
				const startXP = parseInt(initialXP.replace(/[^\d]/g, ''));

				// Purchase and equip frame
				cy.visit('/shop/avatar-frames');
				cy.get('[data-testid="frame-card"]')
					.first()
					.within(() => {
						cy.get('[data-testid="buy-frame"]').click();
						cy.wait(1000);
						cy.get('[data-testid="equip-frame"]').click();
					});

				// Check XP increased
				cy.visit('/profile');
				cy.get('[data-testid="user-xp"]')
					.invoke('text')
					.then((finalXP) => {
						const endXP = parseInt(finalXP.replace(/[^\d]/g, ''));
						expect(endXP).to.be.greaterThan(startXP);
					});
			});
	});

	it('should handle free frames correctly', () => {
		cy.loginAs('test_user');

		// Visit shop and find free frame
		cy.visit('/shop/avatar-frames');
		cy.get('[data-testid="frame-card"]')
			.contains('Free')
			.parent()
			.within(() => {
				cy.get('[data-testid="claim-frame"]').click();
			});

		// Should get frame without DGT deduction
		cy.get('[data-testid="success-toast"]').should('be.visible').and('contain', 'obtained');

		// DGT balance should remain unchanged
		cy.visit('/wallet');
		cy.get('[data-testid="dgt-balance"]').should('contain', '1000');
	});

	afterEach(() => {
		// Cleanup test data
		cy.task('cleanupTestData');
	});
});
