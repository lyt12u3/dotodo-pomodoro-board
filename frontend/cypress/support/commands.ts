/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    drag(targetSelector: string): Chainable<Element>
    login(): Chainable<void>
  }
}

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

// Add login command
Cypress.Commands.add('login', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/login',
    body: {
      email: 'asdw455@gamil.com',
      password: '12345HHH'
    }
  }).then((response) => {
    // Store the token in localStorage
    window.localStorage.setItem('token', response.body.token);
  });
}); 