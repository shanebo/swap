describe('Events', function() {
  it('Sets event to and from when firing before', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('http://127.0.0.1:8888/');

    cy
    .contains('Events Link').click()
    .then(() => {
      expect(stub.getCall(0)).to.be.calledWith('Before from: http://127.0.0.1:8888/, to: http://127.0.0.1:8888/events');
    });
  });

  it('Sets event to and from when firing on', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('http://127.0.0.1:8888/');

    cy
    .contains('Events Link').click()
    .then(() => {
      expect(stub.getCall(1)).to.be.calledWith('On from: http://127.0.0.1:8888/, to: http://127.0.0.1:8888/events');
    });
  });

  it('Sets event to and from when firing off', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('http://127.0.0.1:8888/events');

    cy
    .contains('Home').click()
    .then(() => {
      expect(stub.getCall(1)).to.be.calledWith('Off from: http://127.0.0.1:8888/events, to: http://127.0.0.1:8888/');
    });
  });
});
