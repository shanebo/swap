const {
  qsPane,
  qsPaneContent,
  qsPaneCloseBtn,
  qsPaneIsOpen
} = require('../support/selectors');


describe('History', function() {
  it('goes backward in history', function(done) {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('About Link').click();

    cy.go('back');

    cy.url().then(($url) => {
      setTimeout(function() {
        expect($url).to.equal('http://127.0.0.1:8888/');
        cy.title().should('equal', 'Home');
        cy.get('.header').should('equal', 'Home Header');
        cy.get('.content').should('equal', 'Home Content');
        done();
      }, 100);
    });
  });

  it('goes forward in history', function(done) {
    cy.visit('http://127.0.0.1:8888/');
    cy.contains('About Link').click();
    cy.go('back');

    cy.go('forward');

    cy.url().then(($url) => {
      setTimeout(function() {
        expect($url).to.equal('http://127.0.0.1:8888/about');
        cy.title().should('equal', 'About');
        cy.get('.header').should('equal', 'Header');
        cy.get('.content').should('equal', 'About page');
        done();
      }, 100);
    });
  });
});

describe('Pane History', function() {
  it('goes backward in history on a pane', function(done) {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('View Donation').click();

    cy.go('back');

    cy.get(qsPaneContent).then(($el) => {
      setTimeout(function() {
        expect($el).to.contain('Account Info');
        cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
        done();
      }, 100);
    });
  });

  it('goes forward in history on a pane', function(done) {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('View Donation').click();
    cy.go('back');

    cy.go('forward');

    cy.get(qsPaneContent).then(($el) => {
      setTimeout(function() {
        expect($el).to.contain('Donation Info');
        cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/donation');
        done();
      }, 100);
    });
  });

  it('goes backward in history on a pane after using the pane back button', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('View Donation').click();

    cy.get(qsPaneCloseBtn).click();
    cy.go('back');

    cy.get(qsPaneContent).should('contain', 'Donation Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/donation');
  });

  it('goes backward in history to close a pane entirely', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();

    cy.go('back');

    cy.url().should('eq', 'http://127.0.0.1:8888/accounts');
    cy.get(qsPane).should('not.exist');
  });

  it('goes backward and then forward in history to open a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();

    cy.go('back');
    cy.go('forward');

    cy.get(qsPaneContent).should('contain', 'Account Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
  });

  it('goes backward in history to re-open a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.get(qsPaneCloseBtn).click();

    cy.go('back');

    cy.get(qsPaneContent).should('contain', 'Account Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
  });

  it('goes backward and forward in history to re-close a pane', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.get(qsPaneCloseBtn).click();

    cy.go('back');
    cy.go('forward');

    cy.url().should('eq', 'http://127.0.0.1:8888/accounts');
    cy.get(qsPane).should('not.exist');
  });

  it('goes backward in history to re-open a pane with retained pane-history', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.get(qsPaneCloseBtn).click();

    cy.go('back');

    cy.get(qsPaneContent).should('contain', 'Account Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
  });

  it('goes backward in history to re-open a pane with retained pane-history and use pane back button', function() {
    cy.visit('http://127.0.0.1:8888/accounts');
    cy.contains('View Account').click();
    cy.contains('View Donation').click();
    cy.get(qsPaneCloseBtn).click();

    cy.go('back');
    cy.get(qsPaneCloseBtn).click();

    cy.get(qsPaneContent).should('contain', 'Account Info');
    cy.url().should('eq', 'http://127.0.0.1:8888/accounts#pane=/account');
  });

});
