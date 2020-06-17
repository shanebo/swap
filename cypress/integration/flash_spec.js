describe('Notice',() => {
  it('replaces the notice content if new notice content comes in', function() {
    cy.visit('http://127.0.0.1:8888/notice');

    cy.get('.content').should('contain', 'Notice Page');
    cy.get('.Notice').should('contain', 'A notice message');

    cy.contains('Update Content').click();

    cy.get('.content').should('contain', 'Content Updated');
    cy.get('.Notice').should('contain', 'Notice message updated');
  });

  it("loads the whole page if new notice content comes in and there isn't existing notice content", function() {
    cy.visit('http://127.0.0.1:8888/no-notice');

    cy.get('.content').should('contain', 'No Notice Page');

    cy.contains('Update Content and Add Notice').click();

    cy.get('.content').should('contain', 'Notice Page');
    cy.get('.Notice').should('contain', 'A notice message');
  });
  
  
});
