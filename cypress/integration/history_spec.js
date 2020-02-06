describe('History', function() {
  it('goes backward in history', function() {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('About Link').click();

    cy.go('back');

    cy.url().should('equal', 'http://127.0.0.1:8888/');
    cy.title().should('equal', 'Home');
    cy.get('.header').should('contain', 'Home Header');
    cy.get('.content').should('contain', 'Home Content');
  });

  it('goes forward in history', function() {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('About Link').click();
    cy.go('back');

    cy.go('forward');

    cy.url().should('equal', 'http://127.0.0.1:8888/about');
    cy.title().should('equal', 'About');
    cy.get('.header').should('contain', 'Header');
    cy.get('.content').should('contain', 'About page');
  });
});

describe('Pane History', function() {
  it('goes backward in history on a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('View Donation').click();

    cy.go('back');

    cy.get('.PaneContent').should('contain', 'Account Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
    cy.get('.PaneBackBtn').should('be.hidden');
  });

  it('goes forward in history on a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('View Donation').click();
    cy.go('back');

    cy.go('forward');

    cy.get('.PaneContent').should('contain', 'Donation Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/donation');
    cy.get('.PaneBackBtn').should('be.visible');
  });

  it('goes backward in history on a pane after using the pane back button', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('View Donation').click();

    cy.get('.PaneBackBtn').click();
    cy.go('back');

    cy.get('.PaneContent').should('contain', 'Donation Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/donation');
    cy.get('.PaneBackBtn').should('be.visible');
  });

  it('goes backward in history to close a pane entirely', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();

    cy.go('back');

    cy.url().should('eq', 'http://127.0.0.1:8888/accounts');
    cy.get('[swap-pane-is-active]').should('not.exist');

    cy.get('.PanesHolder > div').each((div, d) => {
      if (d === 0) {
        cy.get(div).should('have.class', 'PaneContent');
      } else {
        cy.get(div).invoke('html').should('equal', '');
      }
    });
  });

  it('goes backward and then forward in history to open a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();

    cy.go('back');
    cy.go('forward');

    cy.get('.PaneContent').should('contain', 'Account Info');
    cy.get('[swap-pane-is-active]').should('exist');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
    cy.get('.PaneBackBtn').should('be.hidden');
  });

  it('goes backward in history to re-open a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.get('.PaneCloseBtn').click();

    cy.go('back');

    cy.get('.PaneContent').should('contain', 'Account Info');
    cy.get('[swap-pane-is-active]').should('exist');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
    cy.get('.PaneBackBtn').should('be.hidden');
  });

  it('goes backward and forward in history to re-close a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.get('.PaneCloseBtn').click();

    cy.go('back');
    cy.go('forward');

    cy.url().should('eq', 'http://127.0.0.1:8888/accounts');
    cy.get('[swap-pane-is-active]').should('not.exist');

    cy.get('.PanesHolder > div').each((div, d) => {
      cy.get(div).invoke('html').should('equal', '');

      if (d === 0) {
        cy.get(div).should('have.class', 'PaneContent');
      }
    });
  });
});
