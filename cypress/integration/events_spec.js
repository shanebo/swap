describe('Events', function() {
  before(function() {
    Cypress.config('baseUrl', 'http://127.0.0.1:8888/');
  });

  describe('before', function() {
    it('fires before a route requested', function() {
      const stub = cy.stub();
      cy.on('window:alert', stub)
      cy.visit('/');

      cy
      .contains('Events Link').click()
      .then(() => {
        expect(stub.getCall(0)).to.be.calledWith('Before from: http://127.0.0.1:8888/, to: http://127.0.0.1:8888/events');
      });
    });
  });

  describe('on', function() {
    it('fires when a request completes', function() {
      cy.visit('/');
      cy.contains('Events Link').click();
      cy.get('.content').should('contain', 'On from: http://127.0.0.1:8888/, to: http://127.0.0.1:8888/events');
    });

    it('fires when directly hitting a route', function() {
      cy.visit('/');
      cy.visit('/events');
      cy.get('.content').should('contain', 'On from: null, to: http://127.0.0.1:8888/events');
    });

    it('fires when directly hitting a route with an anchor', function() {
      cy.visit('/');
      cy.visit('/events#anchor');
      cy.get('.content').should('contain', 'On from: null, to: http://127.0.0.1:8888/events#anchor');
    });

    it('fires when directly hitting a route with a pane url', function() {
      cy.visit('/');
      cy.visit('/events#pane=/account');
      cy.get('.content').should('contain', 'On from: null, to: http://127.0.0.1:8888/events#pane=/account');
    });
  });

  describe('off', function() {
    it('fires when leaving a route', function() {
      const stub = cy.stub();
      cy.on('window:alert', stub)
      cy.visit('/events');

      cy
      .contains('Home').click()
      .then(() => {
        expect(stub.getCall(0)).to.be.calledWith('Off from: http://127.0.0.1:8888/events, to: http://127.0.0.1:8888/');
      });
    });

    it('fires when leaving a route to a post form', function() {
      const stub = cy.stub();
      cy.on('window:alert', stub)
      cy.visit('/events');

      cy
      .contains('Submit').click()
      .then(() => {
        expect(stub.getCall(0)).to.be.calledWith('Off from: http://127.0.0.1:8888/events, to: http://127.0.0.1:8888/events-submit');
      });
    });

    it('fires when leaving a route for a formaction post request', function() {
      const stub = cy.stub();
      cy.on('window:alert', stub)
      cy.visit('/events');

      cy
      .contains('Formaction').click()
      .then(() => {
        expect(stub.getCall(0)).to.be.calledWith('Off from: http://127.0.0.1:8888/events, to: http://127.0.0.1:8888/events-submit');
      });
    });

    it('fires when history navigation happens', function() {
      const stub = cy.stub();
      cy.on('window:alert', stub)
      cy.visit('/');
      cy.contains('Events Link').click();

      cy
      .go('back')
      .then(() => {
        expect(stub.getCall(1)).to.be.calledWith('Off from: http://127.0.0.1:8888/events, to: http://127.0.0.1:8888/');
      });
    });

    it('fires when leaving a url with an anchor', function() {
      const stub = cy.stub();
      cy.on('window:alert', stub)
      cy.visit('/');
      cy.contains('Anchor Events Link').click();

      cy
      .go('back')
      .then(() => {
        expect(stub.getCall(1)).to.be.calledWith('Off from: http://127.0.0.1:8888/events#anchor, to: http://127.0.0.1:8888/');
      });
    });
  });
});
