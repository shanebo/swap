const {
  qsIsLoading
} = require('../support/selectors');


describe('Full Page Swaps', function() {
  it('swaps a full page', function() {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('About Link').click();
    cy.url().should('include', '/about');
    cy.title().should('equal', 'About');
    cy.get('.header').should('contain', 'Header');
    cy.get('.content').should('contain', 'About page');
  });

  it('does nothing on a link with no href', function() {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('Nothing Link').click();
    cy.get(qsIsLoading).should('not.exist');
    cy.url().should('equal', 'http://127.0.0.1:8888/');
    cy.title().should('equal', 'Home');
  });

  it('goes to anchor link on another page', function() {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('Anchor Link').click();
    cy.url().should('equal', 'http://127.0.0.1:8888/about#layout');
    cy.title().should('equal', 'About');
  });

  it('goes to anchor link on same page', function() {
    cy.visit('http://127.0.0.1:8888/about');

    cy.get('#tag').then(($tag) => {
      cy.contains('Anchor Link').click();

      cy.url().should('equal', 'http://127.0.0.1:8888/about#layout');
      cy.get('#tag').invoke('text').should('equal', $tag.text());
    });
  });

  // it('does a normal network request with meta (cmd, ctrl) clicks', function() {
  //   // cy.visit('http://127.0.0.1:8888/', {
  //   //   onBeforeLoad: (win) => {
  //   //     cy.stub(win, 'open')
  //   //   }
  //   // });
  //   cy.visit('http://127.0.0.1:8888/');

  //   Cypress.on('window:after:load', (win) => {
  //     cy.stub(win, 'open');
  //   });
  //   cy.get('body').type('{meta}', { release: false });
  //   cy.contains('Delayed Link').click();
  //   cy.window().its('open').should('be.called');
  // });

  // it('hard refreshes on links to external domains', function() {
  //   cy.visit('http://127.0.0.1:8888/');
  //   cy.contains('External Link').click();
  //   cy.get(qsIsLoading).should('not.exist');
  // });

  it('hard refreshes with data-swap=false', function() {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('Hard Delay').click();
    cy.get(qsIsLoading).should('not.exist');
    cy.url().should('include', '/delayed');
    cy.title().should('equal', 'Delayed');
    cy.get('.header').should('contain', 'Header');
    cy.get('.content').should('contain', 'Delayed page');
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

  context("some data-swap elements exist but some don't", function() {
    it('swaps the full page', function() {
      cy.visit('http://127.0.0.1:8888/');
      cy.contains('About Elements').click();
      cy.url().should('include', '/about');
      cy.title().should('equal', 'About');
      cy.get('.header').should('contain', 'Header');
      cy.get('.content').should('contain', 'About page');
    });
  });

  context('link returns non-2xx result', function() {
    it('swaps the full page', function() {
      cy.visit('http://127.0.0.1:8888/');
      cy.contains('Error page').click();
      cy.url().should('include', '/error');
      cy.title().should('equal', '500 Error');
      cy.get('.header').should('contain', '500 Error');
      cy.get('.content').should('contain', 'An Error Occurred');
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
    cy.get('.header').should('contain', 'Home Header');
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

describe('Inline swapping', function() {
  it('swaps content without changing the url', function() {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('Inline About').click();
    cy.url().should('not.include', '/about');
    cy.title().should('not.equal', 'About');
    cy.get('.content').should('contain', 'About page');
    cy.get('.header').should('contain', 'Home Header');
  });
});
