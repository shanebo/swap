describe('Flash',() => {
  it('replaces the flash content if new flash content comes in', function() {
    cy.visit('http://127.0.0.1:8888/flash');

    cy.get('.content').should('contain', 'Flash Page');
    cy.get('.Flash').should('contain', 'A flash message');

    cy.contains('Update Content').click();

    cy.get('.content').should('contain', 'Content Updated');
    cy.get('.Flash').should('contain', 'Flash message updated');
  });

  it('loads the whole page if new flash content comes in', function() {
    cy.visit('http://127.0.0.1:8888/no-flash');

    cy.get('.content').should('contain', 'No Flash Page');

    cy.contains('Update Content and Add Flash').click();

    cy.get('.content').should('contain', 'Flash Page');
    cy.get('.Flash').should('contain', 'A flash message');
  });
});
