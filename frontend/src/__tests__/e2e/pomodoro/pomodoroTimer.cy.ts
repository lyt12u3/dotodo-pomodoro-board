describe('Pomodoro Timer', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login(); // Custom command that handles authentication
    
    // Create a test task to work with
    cy.createTestTask('Test Task for Pomodoro'); // Custom command
  });

  it('should start and complete a pomodoro session', () => {
    // Start timer for the test task
    cy.get('[data-testid="start-pomodoro-button"]').click();

    // Verify timer started
    cy.get('[data-testid="timer-display"]')
      .should('be.visible')
      .and('contain', '25:00');

    // Verify timer is counting down
    cy.wait(1000); // Wait 1 second
    cy.get('[data-testid="timer-display"]')
      .should('not.contain', '25:00');

    // Fast forward to near completion (mock time)
    cy.clock().then((clock) => {
      clock.tick(24 * 60 * 1000); // Fast forward 24 minutes
    });

    // Verify almost done
    cy.get('[data-testid="timer-display"]')
      .should('contain', '01:00');

    // Complete the session
    cy.clock().then((clock) => {
      clock.tick(60 * 1000); // Complete the last minute
    });

    // Verify completion
    cy.get('[data-testid="break-timer-display"]')
      .should('be.visible');
    
    cy.get('[data-testid="completed-pomodoros"]')
      .should('contain', '1');
  });

  it('should pause and resume timer', () => {
    // Start timer
    cy.get('[data-testid="start-pomodoro-button"]').click();

    // Wait a bit and pause
    cy.wait(2000);
    cy.get('[data-testid="pause-pomodoro-button"]').click();

    // Get time when paused
    cy.get('[data-testid="timer-display"]').invoke('text').then((pausedTime) => {
      // Wait and verify time hasn't changed
      cy.wait(1000);
      cy.get('[data-testid="timer-display"]')
        .should('contain', pausedTime);

      // Resume timer
      cy.get('[data-testid="resume-pomodoro-button"]').click();

      // Verify timer continues
      cy.wait(1000);
      cy.get('[data-testid="timer-display"]')
        .should('not.contain', pausedTime);
    });
  });

  it('should reset timer when requested', () => {
    // Start timer
    cy.get('[data-testid="start-pomodoro-button"]').click();

    // Wait a bit
    cy.wait(2000);

    // Reset timer
    cy.get('[data-testid="reset-pomodoro-button"]').click();

    // Verify timer reset to initial state
    cy.get('[data-testid="timer-display"]')
      .should('contain', '25:00');

    cy.get('[data-testid="completed-pomodoros"]')
      .should('contain', '0');
  });

  it('should switch to break timer after completion', () => {
    // Start and complete a pomodoro
    cy.get('[data-testid="start-pomodoro-button"]').click();
    
    cy.clock().then((clock) => {
      clock.tick(25 * 60 * 1000); // Complete the pomodoro
    });

    // Verify break timer started
    cy.get('[data-testid="break-timer-display"]')
      .should('be.visible')
      .and('contain', '05:00');

    // Complete break
    cy.clock().then((clock) => {
      clock.tick(5 * 60 * 1000); // Complete the break
    });

    // Verify back to work timer
    cy.get('[data-testid="timer-display"]')
      .should('contain', '25:00');
  });
}); 