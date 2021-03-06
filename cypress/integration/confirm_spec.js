const {
  qsConfirm
} = require('../support/selectors');


describe('Confirm functionality', function() {
  before(function() {
    Cypress.config('baseUrl', 'http://127.0.0.1:8888/');
  });

  it('opens a confirm modal and cancels', function() {
    cy.visit('/confirm');
    cy.contains('Cancel Subscription').click();
    cy.get(`${qsConfirm}.is-active`).should('exist');
    cy.get('[data-swap-model-confirm-cancel]').click();
    cy.contains('Cancel Subscription');
  });

  it('opens a confirm modal and continues', function() {
    cy.visit('/confirm');
    cy.contains('Cancel Subscription').click();
    cy.get(`${qsConfirm}.is-active`).should('exist');
    cy.get('[data-swap-model-confirm-ok]').click();
    cy.get('.Main').contains('Canceled!');
  });
});
