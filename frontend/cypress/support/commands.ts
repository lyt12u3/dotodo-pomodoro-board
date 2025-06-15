/// <reference types="cypress" />

// Add drag and drop support
Cypress.Commands.add('drag', { prevSubject: 'element' }, (subject, targetSelector) => {
  const dataTransfer = new DataTransfer();
  
  cy.wrap(subject).trigger('dragstart', {
    dataTransfer
  });

  cy.get(targetSelector).trigger('dragover', {
    dataTransfer
  });

  cy.get(targetSelector).trigger('drop', {
    dataTransfer
  });

  cy.wrap(subject).trigger('dragend');
});

declare global {
  namespace Cypress {
    interface Chainable {
      drag(targetSelector: string): Chainable<Element>
      login(): Chainable<void>;
      createTestTask(title: string): Chainable<void>;
    }
  }
}

// Command to handle login
Cypress.Commands.add('login', () => {
  // Mock the authentication
  cy.window().then((window) => {
    window.localStorage.setItem('auth_token', 'test_token');
    window.localStorage.setItem('user', JSON.stringify({
      id: 'test_user',
      email: 'test@example.com',
      name: 'Test User'
    }));
  });
});

// Command to create a test task
Cypress.Commands.add('createTestTask', (title: string) => {
  cy.get('[data-testid="create-task-button"]').click();
  cy.get('[data-testid="task-title-input"]').type(title);
  cy.get('[data-testid="task-description-input"]').type('Test task description');
  cy.get('[data-testid="estimated-pomodoros-input"]').clear().type('3');
  cy.get('[data-testid="submit-task-button"]').click();
}); 