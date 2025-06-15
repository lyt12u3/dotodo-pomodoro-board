describe('Change Pomodoro settings', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings');
    cy.get('[data-testid="settings-form"]', { timeout: 10000 }).should('exist');
  });

  it('should change Pomodoro duration', () => {
    cy.get('[data-testid="pomodoro-duration-input"]')
      .clear()
      .type('30');
    cy.get('[data-testid="save-settings-button"]').click();
    
    // Verify success message
    cy.get('[data-testid="success-message"]')
      .should('exist')
      .and('contain.text', 'Settings saved');

    // Reload and verify persistence
    cy.reload();
    cy.get('[data-testid="pomodoro-duration-input"]').should('have.value', '30');
  });

  it('should change break duration', () => {
    cy.get('[data-testid="break-duration-input"]')
      .clear()
      .type('10');
    cy.get('[data-testid="save-settings-button"]').click();
    
    cy.reload();
    cy.get('[data-testid="break-duration-input"]').should('have.value', '10');
  });

  it('should validate invalid durations', () => {
    // Test too short duration
    cy.get('[data-testid="pomodoro-duration-input"]')
      .clear()
      .type('1');
    cy.get('[data-testid="save-settings-button"]').click();
    cy.get('[data-testid="error-message"]')
      .should('exist')
      .and('contain.text', 'Pomodoro duration must be at least 5 minutes');

    // Test too long duration
    cy.get('[data-testid="pomodoro-duration-input"]')
      .clear()
      .type('120');
    cy.get('[data-testid="save-settings-button"]').click();
    cy.get('[data-testid="error-message"]')
      .should('exist')
      .and('contain.text', 'Pomodoro duration cannot exceed 60 minutes');
  });

  it('should toggle notification settings', () => {
    cy.get('[data-testid="notifications-toggle"]').click();
    cy.get('[data-testid="save-settings-button"]').click();
    
    cy.reload();
    cy.get('[data-testid="notifications-toggle"]').should('be.checked');
  });

  it('should reset settings to defaults', () => {
    // First change some settings
    cy.get('[data-testid="pomodoro-duration-input"]')
      .clear()
      .type('30');
    cy.get('[data-testid="save-settings-button"]').click();
    
    // Then reset
    cy.get('[data-testid="reset-settings-button"]').click();
    cy.get('[data-testid="confirm-reset-button"]').click();
    
    // Verify defaults
    cy.get('[data-testid="pomodoro-duration-input"]').should('have.value', '25');
    cy.get('[data-testid="break-duration-input"]').should('have.value', '5');
  });
}); 