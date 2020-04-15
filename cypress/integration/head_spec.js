describe('Head', function() {
  it('runs inline scripts', function() {
    cy.visit('http://127.0.0.1:8888/');

    cy.contains('Head Link').click();

    cy.get('.change-from-inline-script').then(($el) => {
      expect($el).to.have.text('changed');
    });
  });

  it('inserts new js scripts', function(done) {
    cy.visit('http://127.0.0.1:8888/');

    cy.contains('Head Link').click();

    cy.get('.change-from-remote-script').then(($el) => {
      setTimeout(function(){
        expect($el).to.have.text('changed');
        done();
      }, 100);
    });
  });

  it('inserts new css files', function(done) {
    cy.visit('http://127.0.0.1:8888/');

    cy.contains('Head Link').click();

    cy.get('body').then(($el) => {
      setTimeout(function(){
        expect($el).to.have.css('color', 'rgb(165, 42, 42)');
        done();
      }, 100);
    });
  });
});
