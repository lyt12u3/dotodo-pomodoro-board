describe('Pomodoro Task Board E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('should complete a full pomodoro cycle with task management', () => {
    // Create a new task
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-input"]').type('Complete E2E Test{enter}');

    // Start pomodoro timer
    cy.get('[data-testid="timer-start"]').click();

    // Fast-forward time (using cy.clock)
    cy.clock();
    cy.tick(25 * 60 * 1000); // 25 minutes

    // Verify break mode is activated
    cy.get('[data-testid="timer-mode"]').should('contain', 'Break');
    cy.get('[data-testid="timer-display"]').should('contain', '05:00');

    // Move task to in-progress
    cy.get('[data-testid="task-item"]').first()
      .drag('[data-testid="column-IN_PROGRESS"]');

    // Verify task moved
    cy.get('[data-testid="column-IN_PROGRESS"]')
      .should('contain', 'Complete E2E Test');
  });

  it('should handle multiple tasks and timer resets', () => {
    // Create multiple tasks
    const tasks = ['Task 1', 'Task 2', 'Task 3'];
    tasks.forEach(task => {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-input"]').type(`${task}{enter}`);
    });

    // Start and reset timer multiple times
    cy.get('[data-testid="timer-start"]').click();
    cy.clock();
    cy.tick(5 * 60 * 1000); // 5 minutes
    cy.get('[data-testid="timer-reset"]').click();
    cy.get('[data-testid="timer-display"]').should('contain', '25:00');

    // Move tasks between columns
    cy.get('[data-testid="task-item"]').first()
      .drag('[data-testid="column-IN_PROGRESS"]');
    cy.get('[data-testid="task-item"]').first()
      .drag('[data-testid="column-DONE"]');

    // Verify task positions
    cy.get('[data-testid="column-IN_PROGRESS"]')
      .should('contain', tasks[0]);
    cy.get('[data-testid="column-DONE"]')
      .should('contain', tasks[1]);
  });

  it('should handle stress test with many tasks', () => {
    // Create 50 tasks
    for (let i = 1; i <= 50; i++) {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-input"]').type(`Task ${i}{enter}`);
    }

    // Verify all tasks were created
    cy.get('[data-testid="task-item"]').should('have.length', 50);

    // Rapidly move tasks between columns
    for (let i = 1; i <= 10; i++) {
      cy.get('[data-testid="task-item"]').first()
        .drag('[data-testid="column-IN_PROGRESS"]');
      cy.get('[data-testid="task-item"]').first()
        .drag('[data-testid="column-DONE"]');
    }

    // Verify task distribution
    cy.get('[data-testid="column-IN_PROGRESS"] [data-testid="task-item"]')
      .should('have.length.gt', 0);
    cy.get('[data-testid="column-DONE"] [data-testid="task-item"]')
      .should('have.length.gt', 0);
  });

  it('should persist state across page reloads', () => {
    // Create tasks and start timer
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-input"]').type('Persistent Task{enter}');
    cy.get('[data-testid="timer-start"]').click();

    // Move task to in-progress
    cy.get('[data-testid="task-item"]').first()
      .drag('[data-testid="column-IN_PROGRESS"]');

    // Reload page
    cy.reload();

    // Verify state persisted
    cy.get('[data-testid="column-IN_PROGRESS"]')
      .should('contain', 'Persistent Task');
    cy.get('[data-testid="timer-display"]')
      .should('not.contain', '25:00'); // Timer should not be reset
  });

  it('should handle rapid timer mode switches', () => {
    // Switch modes rapidly
    for (let i = 0; i < 10; i++) {
      cy.get('[data-testid="timer-mode-switch"]').click();
      cy.get('[data-testid="timer-start"]').click();
      cy.clock();
      cy.tick(1000); // Advance 1 second
      cy.get('[data-testid="timer-reset"]').click();
    }

    // Verify timer is in a valid state
    cy.get('[data-testid="timer-display"]')
      .invoke('text')
      .should('match', /^\d{2}:\d{2}$/);
  });

  it('should maintain task order during drag operations', () => {
    // Create ordered tasks
    const tasks = ['First', 'Second', 'Third', 'Fourth'];
    tasks.forEach(task => {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-input"]').type(`${task}{enter}`);
    });

    // Perform complex drag operations
    cy.get('[data-testid="task-item"]').first() // Move First to IN_PROGRESS
      .drag('[data-testid="column-IN_PROGRESS"]');
    cy.get('[data-testid="task-item"]').last() // Move Fourth to IN_PROGRESS
      .drag('[data-testid="column-IN_PROGRESS"]');
    cy.get('[data-testid="task-item"]').eq(1) // Move Second to DONE
      .drag('[data-testid="column-DONE"]');

    // Verify order in each column
    cy.get('[data-testid="column-TODO"] [data-testid="task-item"]')
      .should('contain', 'Third');
    cy.get('[data-testid="column-IN_PROGRESS"] [data-testid="task-item"]')
      .first().should('contain', 'First');
    cy.get('[data-testid="column-IN_PROGRESS"] [data-testid="task-item"]')
      .last().should('contain', 'Fourth');
    cy.get('[data-testid="column-DONE"] [data-testid="task-item"]')
      .should('contain', 'Second');
  });
}); 