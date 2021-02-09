describe('Events', function() {
  before(function() {
    Cypress.config('baseUrl', 'http://127.0.0.1:8888/');
  });

  it('Sets event to and from when firing before', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('/');

    cy
    .contains('Events Link').click()
    .then(() => {
      expect(stub.getCall(0)).to.be.calledWith('Before from: http://127.0.0.1:8888/, to: http://127.0.0.1:8888/events');
    });
  });

  it('fires off events when going to post form', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('/events');

    cy
    .contains('Submit').click()
    .then(() => {
      expect(stub.getCall(2)).to.be.calledWith('Off from: http://127.0.0.1:8888/events, to: http://127.0.0.1:8888/events-submit');
    });
  });

  it('fires off events when going to post form using formaction', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('/events');

    cy
    .contains('Formaction').click()
    .then(() => {
      expect(stub.getCall(2)).to.be.calledWith('Off from: http://127.0.0.1:8888/events, to: http://127.0.0.1:8888/events-submit');
    });
  });

  it('Sets event to and from when firing on', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('/');

    cy
    .contains('Events Link').click()
    .then(() => {
      expect(stub.getCall(1)).to.be.calledWith('On from: http://127.0.0.1:8888/, to: http://127.0.0.1:8888/events');
    });
  });

  it('Sets event to and from when firing off', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('/events');

    cy
    .contains('Home').click()
    .then(() => {
      expect(stub.getCall(1)).to.be.calledWith('Off from: http://127.0.0.1:8888/events, to: http://127.0.0.1:8888/');
    });
  });

  it('Sets event to and from to null when firing on for loaded', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)

    cy
    .visit('/events')
    .then(() => {
      expect(stub.getCall(0)).to.be.calledWith('On from: null, to: http://127.0.0.1:8888/events');
    });
  });

  it('Sets event to and from to null when firing on for loaded with anchor tag', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)

    cy
    .visit('/events#anchor')
    .then(() => {
      expect(stub.getCall(0)).to.be.calledWith('On from: null, to: http://127.0.0.1:8888/events#anchor');
    });
  });

  it('Sets event to and from to null when firing on for loaded with pane url', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)

    cy
    .visit('/events#pane=/account')
    .then(() => {
      expect(stub.getCall(0)).to.be.calledWith('On from: null, to: http://127.0.0.1:8888/events#pane=/account');
    });
  });

  it('Sets off and on event to and from to when popstate fires', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('/');
    cy.contains('Events Link').click();

    cy
    .go('back')
    .then(() => {
      expect(stub.getCall(2)).to.be.calledWith('Off from: http://127.0.0.1:8888/events, to: http://127.0.0.1:8888/');
    });
  });

  it('Sets off and on event to and from to when popstate fires with anchor in url', function() {
    const stub = cy.stub();
    cy.on('window:alert', stub)
    cy.visit('/');
    cy.contains('Anchor Events Link').click();

    cy
    .go('back')
    .then(() => {
      expect(stub.getCall(2)).to.be.calledWith('Off from: http://127.0.0.1:8888/events#anchor, to: http://127.0.0.1:8888/');
    });
  });
});
