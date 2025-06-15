describe('Pomodoro Task Management', () => {
  beforeEach(() => {
    // Login and set up auth state
    cy.login();
    
    // Visit the page after login
    cy.visit('/');
    
    // Wait for the app to be ready
    cy.get('input[placeholder="Add task..."]', { timeout: 10000 }).should('exist');
  });

  it('should create and complete tasks', () => {
    // Create a new task
    cy.get('input[placeholder="Add task..."]').first().type('Complete E2E Test{enter}');

    // Verify task was created
    cy.contains('Complete E2E Test').should('be.visible');

    // Complete the task
    cy.get('button').contains('Complete E2E Test').parent().find('button').first().click();
    
    // Verify task is completed
    cy.contains('Complete E2E Test').parent().should('have.class', 'opacity-60');
  });

  it('should handle multiple tasks', () => {
    const tasks = ['Task 1', 'Task 2', 'Task 3'];
    
    // Create multiple tasks
    tasks.forEach(task => {
      cy.get('input[placeholder="Add task..."]').first().type(`${task}{enter}`);
    });

    // Verify all tasks are created
    tasks.forEach(task => {
      cy.contains(task).should('be.visible');
    });

    // Complete tasks
    tasks.forEach(task => {
      cy.contains(task).parent().find('button').first().click();
      cy.contains(task).parent().should('have.class', 'opacity-60');
    });
  });

  it('should handle task priorities', () => {
    // Create a task
    cy.get('input[placeholder="Add task..."]').first().type('Priority Task{enter}');

    // Open priority menu
    cy.contains('Priority Task').parent().find('button').contains('Priority').click();

    // Change priority to high
    cy.contains('high').click();

    // Verify priority changed
    cy.contains('Priority Task').parent().find('.bg-priority-high').should('exist');
  });

  it('should handle task deletion', () => {
    // Create a task
    cy.get('input[placeholder="Add task..."]').first().type('Task to Delete{enter}');

    // Click delete button
    cy.contains('Task to Delete').parent().find('button').last().click();

    // Confirm deletion
    cy.contains('Delete').click();

    // Verify task is deleted
    cy.contains('Task to Delete').should('not.exist');
  });

  it('should persist tasks after reload', () => {
    // Create a task
    cy.get('input[placeholder="Add task..."]').first().type('Persistent Task{enter}');

    // Verify task was created
    cy.contains('Persistent Task').should('be.visible');

    // Reload the page
    cy.reload();

    // Wait for app to be ready after reload
    cy.get('input[placeholder="Add task..."]', { timeout: 10000 }).should('exist');

    // Verify task still exists
    cy.contains('Persistent Task').should('be.visible');
  });
}); 