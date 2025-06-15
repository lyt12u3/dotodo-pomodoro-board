describe('Pomodoro Settings', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login(); // Custom command that handles authentication
    cy.get('[data-testid="settings-button"]').click();
  });

  it('should update pomodoro duration', () => {
    // Change work duration to 30 minutes
    cy.get('[data-testid="work-duration-input"]')
      .clear()
      .type('30');

    // Save settings
    cy.get('[data-testid="save-settings-button"]').click();

    // Verify settings saved
    cy.get('[data-testid="settings-saved-toast"]')
      .should('be.visible');

    // Go back to timer and verify new duration
    cy.get('[data-testid="back-to-timer-button"]').click();
    cy.get('[data-testid="timer-display"]')
      .should('contain', '30:00');
  });

  it('should update break duration', () => {
    // Change break duration to 10 minutes
    cy.get('[data-testid="break-duration-input"]')
      .clear()
      .type('10');

    // Save settings
    cy.get('[data-testid="save-settings-button"]').click();

    // Complete a pomodoro to verify break duration
    cy.get('[data-testid="back-to-timer-button"]').click();
    cy.get('[data-testid="start-pomodoro-button"]').click();

    // Fast forward to completion
    cy.clock().then((clock) => {
      clock.tick(25 * 60 * 1000); // Complete work session
    });

    // Verify new break duration
    cy.get('[data-testid="break-timer-display"]')
      .should('contain', '10:00');
  });

  it('should validate input ranges', () => {
    // Try invalid work duration
    cy.get('[data-testid="work-duration-input"]')
      .clear()
      .type('0');

    // Verify error message
    cy.get('[data-testid="work-duration-error"]')
      .should('be.visible')
      .and('contain', 'Duration must be between 1 and 60 minutes');

    // Try invalid break duration
    cy.get('[data-testid="break-duration-input"]')
      .clear()
      .type('61');

    // Verify error message
    cy.get('[data-testid="break-duration-error"]')
      .should('be.visible')
      .and('contain', 'Duration must be between 1 and 60 minutes');

    // Verify save button is disabled
    cy.get('[data-testid="save-settings-button"]')
      .should('be.disabled');
  });

  it('should persist settings after page reload', () => {
    // Change both durations
    cy.get('[data-testid="work-duration-input"]')
      .clear()
      .type('35');

    cy.get('[data-testid="break-duration-input"]')
      .clear()
      .type('7');

    // Save settings
    cy.get('[data-testid="save-settings-button"]').click();

    // Reload page
    cy.reload();

    // Go to settings
    cy.get('[data-testid="settings-button"]').click();

    // Verify values persisted
    cy.get('[data-testid="work-duration-input"]')
      .should('have.value', '35');

    cy.get('[data-testid="break-duration-input"]')
      .should('have.value', '7');
  });
}); 