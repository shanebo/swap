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
