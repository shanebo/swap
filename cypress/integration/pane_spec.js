describe('Pane functionality', function() {
  it('opens a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');

    cy.contains('View Account').click();

    cy.get('.PaneContent').should('contain', 'Account Info');
    cy.get('[swap-pane-is-active]').should('exist');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
    cy.get('.PaneBackBtn').should('be.hidden');
  });

  it('closes a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    // cy.visit('http://127.0.0.1:8888/accounts#pane=/account');

    cy.get('.PaneCloseBtn').click();

    cy.get('[swap-pane-is-active]').should('not.exist');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts');

    cy.get('.PanesHolder > div').each((div, d) => {
      if (d === 0) {
        cy.get(div).should('have.class', 'PaneContent');
      } else {
        cy.get(div).invoke('html').should('equal', '');
      }
    });

    cy.window().its('swap.pane.isActive').should('equal', false);
  });

  it('goes to the next pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();

    cy.contains('View Donation').click();

    cy.get('.PaneContent').should('contain', 'Donation Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/donation');
    cy.get('.PaneBackBtn').should('be.visible');
  });

  it('goes to the previous pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('View Donation').click();

    cy.get('.PaneBackBtn').click();

    cy.get('.PaneContent').should('contain', 'Account Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
    cy.get('.PaneBackBtn').should('be.hidden');
  });

  it('submits a form in a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();

    cy.get('form').submit();

    cy.get('.PaneContent').should('contain', 'Edit Account');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/edit-account');
    cy.get('.PaneBackBtn').should('be.hidden');
  });
});