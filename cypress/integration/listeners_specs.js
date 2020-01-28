describe('Element listeners', function() {
  it('swaps on an element', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)

    cy.visit('http://127.0.0.1:8888/');
    cy
    .contains('Arrive Link').click()
    .then(() => {
      expect(stub.getCall(0)).to.be.calledWith('Arrived')
    });
  });

  it('swaps off an element', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('http://127.0.0.1:8888/leave');

    cy
    .contains('About').click()
    .then(() => {
      expect(stub.getCall(0)).to.be.calledWith('Left')
    });
  });
});

describe('Route listeners', function() {
  it('swaps on a route', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)

    cy.visit('http://127.0.0.1:8888/');
    cy
    .contains('Route Link').click()
    .then(() => {
      expect(stub.getCall(0)).to.be.calledWith('Arrived at route')
    });
  });
});