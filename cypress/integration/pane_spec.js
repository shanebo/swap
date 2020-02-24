describe('Pane functionality', function() {
  it('adds a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');

    cy.contains('View Account').click();

    cy.get('.PaneContent').should('contain', 'Account Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
  });

  it('closes a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();

    cy.get('.PaneCloseBtn').click();

    cy.url().should('eq', 'http://127.0.0.1:8888/accounts');
    cy.get('.Pane').should('not.exist');
  });

  it('add a pane while a pane is open', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();

    cy.contains('View Donation').click();

    cy.get('.PaneContent').should('contain', 'Donation Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/donation');
  });

  it('closes pane while another pane is open', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('View Donation').click();

    cy.get('.Pane:last-child .PaneCloseBtn').click();

    cy.get('.PaneContent').should('contain', 'Account Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
  });

  it('closes all open panes', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('View Donation').click();

    cy.get('.swap-pane').click();

    cy.get('.PaneContent').should('contain', 'Account Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts');
  });

  it('submits a form in a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();

    cy.get('form').submit();

    cy.get('.PaneContent').should('contain', 'Edit Account');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/edit-account');
  });

  it('sends a pane-url header on pane form submissions', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Donation').click();

    cy.contains('Change').click();

    cy.get('.PaneContent').should('contain', 'Donation Editing');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/edit-donation');
  });

  it('does not reload form that is not edited when going back to it', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();
    cy.contains('View Donation').click();

    cy.get('#tag').then(($tag) => {
      cy.get('.Pane:last-child .PaneCloseBtn').click();

      cy.get('#tag').invoke('text').should('equal', $tag.text());
    });
  });

  it('does not reload form that is edited when going back to it', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();
    cy.get('input[type=text]').type('Shane');
    cy.contains('View Donation').click();

    cy.get('#tag').then(($tag) => {
      cy.get('.Pane:last-child .PaneCloseBtn').click();

      cy.get('#tag').invoke('text').should('equal', $tag.text());
    });
  });

  it('does not reload form that is edited but changed back to default value when going back to it', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();
    cy.get('input[type=text]').type('Shane').clear();
    cy.get('input[type=text]').type('Joe');
    cy.contains('View Donation').click();

    cy.get('#tag').then(($tag) => {
      cy.get('.Pane:last-child .PaneCloseBtn').click();

      cy.get('#tag').invoke('text').should('equal', $tag.text());
    });
  });

  it('saving and continuing on a successful form goes back to the previous pane and reloads it if unedited', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();
    cy.get('#tag').then(($tag) => {
      cy.contains('Modify Donation').click();
      cy.contains('Save and Continue').click();

      cy.get('.Pane:last-child .PaneContent').should('contain', 'Edit Account');
      cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/edit-account');
      cy.get('#tag').invoke('text').should('not.equal', $tag.text());
    });
  });

  it('saving and continuing on a successful form goes back to the previous pane and use the redirect html content if prev form is unedited', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();
    cy.get('#tag').then(($tag) => {
      cy.contains('Add Relationship').click();
      cy.contains('Save and Continue').click();

      cy.get('.Pane:last-child .PaneContent').should('contain', 'Edit Account');
      cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/edit-account');
      cy.get('#tag').invoke('text').should('not.equal', $tag.text());
    });
  });

  it('saving and continuing on a successful form goes back to the previous pane and does not reload it if edited', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();
    cy.get('input[type=text]').type('Shane');
    cy.get('#tag').then(($tag) => {
      cy.contains('Modify Donation').click();
      cy.contains('Save and Continue').click();

      cy.get('.PaneContent').should('contain', 'Edit Account');
      cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/edit-account');
      cy.get('#tag').invoke('text').should('equal', $tag.text());
    });
  });

  it('saving and continuing on an unsuccessful form stays on the same pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('Edit Account').click();
    cy.contains('Modify Donation').click();

    cy.get('[type="checkbox"]').check(); // makes it so form fails
    cy.contains('Save and Continue').click();

    cy.get('.Pane:last-child .PaneContent').should('contain', 'Donation Editing');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/edit-donation');
  });

  it('not saving a form and then clicking the back button does not reload the previous pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('Modify Account').click();

    cy.get('#tag').then(($tag) => {
      cy.get('input[type=text]').clear().type('Shane');
      cy.get('.Pane:last-child .PaneCloseBtn').click();

      cy.get('#tag').invoke('text').should('equal', $tag.text());
    });
  });

  it('saving a form and then clicking the back button reloads the previous pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('Modify Account').click();

    cy.get('#tag').then(($tag) => {
      cy.get('input[type=text]').clear().type('Shane');
      cy.get('form').submit();
      cy.get('.Pane:last-child .PaneCloseBtn').click();

      cy.get('#tag').invoke('text').should('not.equal', $tag.text());
    });
  });
});
