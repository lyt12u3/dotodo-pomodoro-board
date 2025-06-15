import { faker } from '@faker-js/faker';

describe('Task Creation', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login(); // Custom command that handles authentication
  });

  it('should create a new task successfully', () => {
    const taskData = {
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      estimatedPomodoros: 3
    };

    // Open task creation dialog
    cy.get('[data-testid="create-task-button"]').click();

    // Fill in task details
    cy.get('[data-testid="task-title-input"]')
      .type(taskData.title);
    
    cy.get('[data-testid="task-description-input"]')
      .type(taskData.description);

    cy.get('[data-testid="estimated-pomodoros-input"]')
      .clear()
      .type(taskData.estimatedPomodoros.toString());

    // Submit the form
    cy.get('[data-testid="submit-task-button"]').click();

    // Verify task was created
    cy.get('[data-testid="task-list"]')
      .should('contain', taskData.title)
      .and('contain', taskData.description);

    // Verify pomodoro count
    cy.get(`[data-testid="task-${taskData.title}-pomodoros"]`)
      .should('contain', taskData.estimatedPomodoros);
  });

  it('should show validation errors for invalid input', () => {
    // Open task creation dialog
    cy.get('[data-testid="create-task-button"]').click();

    // Try to submit empty form
    cy.get('[data-testid="submit-task-button"]').click();

    // Verify validation errors
    cy.get('[data-testid="task-title-error"]')
      .should('be.visible')
      .and('contain', 'Title is required');

    // Try with too long title
    const longTitle = 'a'.repeat(101);
    cy.get('[data-testid="task-title-input"]')
      .type(longTitle);

    cy.get('[data-testid="task-title-error"]')
      .should('be.visible')
      .and('contain', 'Title must be less than 100 characters');
  });

  it('should allow canceling task creation', () => {
    // Open task creation dialog
    cy.get('[data-testid="create-task-button"]').click();

    // Fill some data
    cy.get('[data-testid="task-title-input"]')
      .type('Task to be cancelled');

    // Click cancel button
    cy.get('[data-testid="cancel-task-button"]').click();

    // Verify dialog is closed and task not created
    cy.get('[data-testid="task-creation-dialog"]')
      .should('not.exist');
    
    cy.get('[data-testid="task-list"]')
      .should('not.contain', 'Task to be cancelled');
  });
}); 