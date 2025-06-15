describe('Task Creation', () => {
  beforeEach(() => {
    // Login using custom command that authenticates through backend
    cy.login();
    
    // Visit the tasks page
    cy.visit('/tasks');
    
    // Wait for the app to be ready
    cy.get('input[placeholder="Add task..."]', { timeout: 10000 }).should('exist');
  });

  it('should create a new task successfully', () => {
    const taskName = 'Test Task';

    // Type task name and press enter
    cy.get('input[placeholder="Add task..."]')
      .first()
      .type(`${taskName}{enter}`);

    // Verify task was created and is visible
    cy.contains(taskName).should('be.visible');

    // Verify task is in active (not completed) state
    cy.contains(taskName)
      .parent()
      .should('not.have.class', 'opacity-60');
  });

  it('should create a task with priority', () => {
    const taskName = 'Priority Task';

    // Create task
    cy.get('input[placeholder="Add task..."]')
      .first()
      .type(`${taskName}{enter}`);

    // Set priority to high
    cy.contains(taskName)
      .parent()
      .find('button')
      .contains('Priority')
      .click();
    cy.contains('high').click();

    // Verify priority is set
    cy.contains(taskName)
      .parent()
      .find('.bg-priority-high')
      .should('exist');
  });
}); 