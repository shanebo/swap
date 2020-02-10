describe('Head', function() {
  it('runs inline scripts', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)

    cy.visit('http://127.0.0.1:8888/');
    cy
    .contains('Head Link').click()
    .then(() => {
      expect(stub.getCall(0)).to.be.calledWith('hi from body');
    });
  });

  it('inserts new js scripts', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)

    cy.visit('http://127.0.0.1:8888/');
    cy
    .contains('Head Link').click()
    .then(() => {
      expect(stub.getCall(1)).to.be.calledWith('Hi from Head');
    });
  });

  it('inserts new css files', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)

    cy.visit('http://127.0.0.1:8888/');
    cy.contains('Head Link').click();

    cy.get('body').then(($el) => {
      expect($el).to.have.css('color', 'rgb(165, 42, 42)');
    });
  });
});
