describe('Full Page Swaps', function() {
  it('swaps a full page', function() {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('About Link').click();
    cy.url().should('include', '/about');
    cy.title().should('equal', 'About');
    cy.get('.header').should('contain', 'Header');
    cy.get('.content').should('contain', 'About page');
  });

  context("data-swap elements don't exist", function() {
    it('swaps the full page', function() {
      cy.visit('http://127.0.0.1:8888/');
      cy.contains('About Header').click();
      cy.url().should('include', '/about');
      cy.title().should('equal', 'About');
      cy.get('.header').should('contain', 'Header');
      cy.get('.content').should('contain', 'About page');
    });
  });

  context("some data-swap elements exist but some do", function() {
    it('swaps the full page', function() {
      cy.visit('http://127.0.0.1:8888/');
      cy.contains('About Elements').click();
      cy.url().should('include', '/about');
      cy.title().should('equal', 'About');
      cy.get('.header').should('contain', 'Header');
      cy.get('.content').should('contain', 'About page');
    });
  });
});

describe('Swapping specific elements', function() {
  it('swaps a specific element', function() {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('About Body').click();
    cy.url().should('include', '/about');
    cy.title().should('equal', 'About');
    cy.get('.content').should('contain', 'About page');
    cy.get('.header').should('be.empty');
  });

  it('swaps a specific elements', function() {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('About Header and Body').click();
    cy.url().should('include', '/about');
    cy.title().should('equal', 'About');
    cy.get('.header').should('contain', 'Header');
    cy.get('.content').should('contain', 'About page');
  });
});

// describe('Inline swapping', function() {
//   it('swaps content without changing the url', function() {
//     cy.visit('http://127.0.0.1:8888/');
//     cy.contains('Inline About').click();
//     cy.url().should('not.include', '/about');
//     cy.title().should('equal', 'About');
//     cy.get('.content').should('contain', 'About page');
//     cy.get('.header').should('be.empty');
//   });
// });
