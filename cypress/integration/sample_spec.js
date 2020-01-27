describe('My first test', function(){
  it('Finds the h1 element', function(){
    // arrange: setup initial app state
    // - visit a page
    // - query an element
    // act: take an action
    // - interact with the element
    // assert: make an assertion
    // - make assetion about page content
    // expect(true).to.equal(true);
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('Swap h1 with /dos h1').click();
    cy.url().should('include', '/dos');
    cy.get('p').should('not.exist');
  });
});
