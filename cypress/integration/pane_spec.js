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

  it('sends a pane-url header on pane form submissions', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Donation').click();

    cy.get('form').submit();

    cy.get('.PaneContent').should('contain', 'Edit Donation');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/edit-donation');
    cy.get('.PaneBackBtn').should('be.hidden');
  });

  it('reloads form that is not edited when going back to it', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();
    cy.contains('View Donation').click();

    cy.get('#tag').then(($tag) => {
      cy.get('.PaneBackBtn').click();

      cy.get('#tag').invoke('text').should('not.equal', $tag.text());
    });
  });

  it('does not reload form that is edited when going back to it', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();
    cy.get('input[type=text]').type('Shane');
    cy.contains('View Donation').click();

    cy.get('#tag').then(($tag) => {
      cy.get('.PaneBackBtn').click();

      cy.get('#tag').invoke('text').should('equal', $tag.text());
    });
  });

  it('reloads form that is edited but changed back to default value when going back to it', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();
    cy.get('input[type=text]').type('Shane').clear();
    cy.get('input[type=text]').type('Joe');
    cy.contains('View Donation').click();

    cy.get('#tag').then(($tag) => {
      cy.get('.PaneBackBtn').click();

      cy.get('#tag').invoke('text').should('not.equal', $tag.text());
    });
  });
});
