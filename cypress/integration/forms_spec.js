describe('Forms', function() {
  before(function() {
    Cypress.config('baseUrl', 'http://127.0.0.1:8888/');
  });

  it('does not submit blank fields on GET forms', function() {
    cy.visit('/get-form');

    cy.get('input[name=name]').type('thacker');
    cy.get('form').submit();

    cy.get('body').should('contain', '{"name":"thacker"}');
  });

  it('does submit blank fields on POST forms', function() {
    cy.visit('/post-form');

    cy.get('input[name=name]').type('thacker');
    cy.get('form').submit();

    cy.get('body').should('contain', '{"name":"thacker","email":""}');
  });
});
