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
    }
  }
} 