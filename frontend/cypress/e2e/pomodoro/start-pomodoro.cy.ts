describe('Start Pomodoro timer', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.get('[data-testid="timer"]', { timeout: 10000 }).should('exist');
  });

  it('should start the timer', () => {
    cy.get('[data-testid="start-timer-button"]').click();
    cy.get('[data-testid="timer"]').should('contain.text', '25:00');
    
    // Wait a few seconds and check if timer is counting down
    cy.wait(3000);
    cy.get('[data-testid="timer"]')
      .invoke('text')
      .should('not.equal', '25:00');
  });

  it('should pause and resume the timer', () => {
    cy.get('[data-testid="start-timer-button"]').click();
    cy.wait(1000);
    
    // Pause timer
    cy.get('[data-testid="pause-timer-button"]').click();
    cy.get('[data-testid="timer-status"]').should('contain.text', 'Paused');
    
    // Store timer value
    cy.get('[data-testid="timer"]')
      .invoke('text')
      .then((text) => {
        const pausedTime = text;
        cy.wait(1000);
        // Verify timer hasn't changed while paused
        cy.get('[data-testid="timer"]').should('have.text', pausedTime);
      });

    // Resume timer
    cy.get('[data-testid="start-timer-button"]').click();
    cy.get('[data-testid="timer-status"]').should('contain.text', 'Running');
  });

  it('should reset the timer', () => {
    cy.get('[data-testid="start-timer-button"]').click();
    cy.wait(2000);
    cy.get('[data-testid="reset-timer-button"]').click();
    cy.get('[data-testid="timer"]').should('contain.text', '25:00');
    cy.get('[data-testid="timer-status"]').should('contain.text', 'Ready');
  });

  it('should switch to break after pomodoro completion', () => {
    // For testing, we'll use a custom command to speed up time
    cy.get('[data-testid="start-timer-button"]').click();
    cy.clock();
    cy.tick(25 * 60 * 1000); // Fast forward 25 minutes
    cy.get('[data-testid="timer-mode"]').should('contain.text', 'Break');
    cy.get('[data-testid="timer"]').should('contain.text', '5:00');
  });
}); 