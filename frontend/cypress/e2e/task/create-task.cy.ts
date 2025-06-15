describe('Create new task', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
    cy.visit('/');
    
    // Wait for the task input to be visible
    cy.get('[data-testid="task-input"]', { timeout: 10000 }).should('exist');
  });

  it('should add a new task', () => {
    const taskText = 'Test task';
    cy.get('[data-testid="task-input"]').type(`${taskText}{enter}`);
    cy.contains(taskText).should('exist');
  });

  it('should add a task with priority', () => {
    const taskText = 'Priority task';
    cy.get('[data-testid="task-input"]').type(`${taskText}{enter}`);
    cy.contains(taskText)
      .parent()
      .find('[data-testid="priority-button"]')
      .click();
    cy.contains('high').click();
    cy.contains(taskText)
      .parent()
      .find('.bg-priority-high')
      .should('exist');
  });

  it('should validate empty task input', () => {
    cy.get('[data-testid="task-input"]').type('{enter}');
    cy.get('[data-testid="error-message"]')
      .should('exist')
      .and('contain.text', 'Task cannot be empty');
  });

  it('should mark task as completed', () => {
    const taskText = 'Complete this task';
    cy.get('[data-testid="task-input"]').type(`${taskText}{enter}`);
    cy.contains(taskText)
      .parent()
      .find('[data-testid="complete-task"]')
      .click();
    cy.contains(taskText)
      .parent()
      .should('have.class', 'opacity-60');
  });
}); 