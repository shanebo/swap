const { qsTag } = require('../support/selectors');

describe('Head', function() {
  before(function() {
    Cypress.config('baseUrl', 'http://127.0.0.1:8888/');
  });

  it('runs inline scripts', function(done) {
    cy.visit('/');

    cy.contains('Head Link').click();

    cy.get('.change-from-inline-script').then(($el) => {
      setTimeout(function(){
        expect($el).to.have.text('changed');
        done();
      }, 100);
    });
  });

  it('inserts new js scripts', function(done) {
    cy.visit('/');

    cy.contains('Head Link').click();

    cy.get('.change-from-remote-script').then(($el) => {
      setTimeout(function(){
        expect($el).to.have.text('changed');
        done();
      }, 100);
    });
  });

  it('inserts new css files', function(done) {
    cy.visit('/');

    cy.contains('Head Link').click();

    cy.get('body').then(($el) => {
      setTimeout(function(){
        expect($el).to.have.css('color', 'rgb(165, 42, 42)');
        done();
      }, 100);
    });
  });

  it('injects inline styles', function(done) {
    cy.visit('/');

    cy.contains('Head Link').click();

    cy.get('body').then(($el) => {
      setTimeout(function(){
        expect($el).to.have.css('background-color', 'rgb(200, 12, 12)');
        done();
      }, 100);
    });
  });

  it('replaces all non-asset head elements', function() {
    cy.visit('/');
    cy.get('title').should('contain', 'Home');
    cy.get('[property="og:type"]').should('has.attr', 'content', 'article');
    cy.get('[property="og:url"]').should('has.attr', 'content', 'http://127.0.0.1:8888/');
    cy.get('[property="og:title"]').should('has.attr', 'content', 'Swap');
    cy.contains('About Link').click();
    cy.get('title').should('contain', 'About');
    cy.get('[property="og:type"]').should('not.exist');
    cy.get('[property="og:url"]').should('has.attr', 'content', 'http://127.0.0.1:8888/about');
    cy.get('[property="og:title"]').should('has.attr', 'content', 'About | Swap');
  });

  it('does a hard reload if asset hashes changes', function() {
    cy.visit('/asset');

    cy.get(qsTag).then(($tag) => {
      cy.contains('Change Asset').click(); // link should only swap title, not tag value

      cy.get(qsTag).invoke('text').should('not.equal', $tag.text());
    });
  });
});
