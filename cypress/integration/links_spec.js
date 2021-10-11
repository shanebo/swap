const {
  qsIsLoading,
  qsPaneContent,
  qsTag
} = require('../support/selectors');

describe('Links', function() {
  before(function() {
    Cypress.config('baseUrl', 'http://127.0.0.1:8888/');
  });

  describe('Full Page Swaps', function() {
    it('swaps a full page', function() {
      cy.visit('/');
      cy.contains('About Link').click();
      cy.url().should('include', '/about');
      cy.title().should('equal', 'About');
      cy.get('.header').should('contain', 'Header');
      cy.get('.content').should('contain', 'About page');
    });

    it('does nothing on a link with no href', function() {
      cy.visit('/');
      cy.intercept('GET', '/', {
        statusCode: 400,
        body: 'Swap fired'
      });
      cy.contains('Nothing Link').click();
      cy.get(qsIsLoading).should('not.exist');
      cy.url().should('equal', 'http://127.0.0.1:8888/');
      cy.contains('Swap fired').should('not.exist');
    });

    it('does nothing on a link a blank # href', function() {
      cy.visit('/');
      cy.intercept('GET', '/', {
        statusCode: 400,
        body: 'Swap fired'
      });
      cy.contains('Blank Anchor Link').click();
      cy.get(qsIsLoading).should('not.exist');
      cy.url().should('equal', 'http://127.0.0.1:8888/#');
      cy.contains('Swap fired').should('not.exist');
    });

    it('goes to anchor link on another page', function() {
      cy.visit('/');
      cy.contains('Anchor Link').click();
      cy.url().should('equal', 'http://127.0.0.1:8888/about#layout');
      cy.title().should('equal', 'About');
    });

    it('goes to anchor link on same page', function() {
      cy.visit('/about');

      cy.get(qsTag).then(($tag) => {
        cy.contains('Anchor Link').click();

        cy.url().should('equal', 'http://127.0.0.1:8888/about#layout');
        cy.get(qsTag).invoke('text').should('equal', $tag.text());
      });
    });

    // it('does a normal network request with meta (cmd, ctrl) clicks', function() {
    //   // cy.visit('/', {
    //   //   onBeforeLoad: (win) => {
    //   //     cy.stub(win, 'open')
    //   //   }
    //   // });
    //   cy.visit('/');

    //   Cypress.on('window:after:load', (win) => {
    //     cy.stub(win, 'open');
    //   });
    //   cy.get('body').type('{meta}', { release: false });
    //   cy.contains('Delayed Link').click();
    //   cy.window().its('open').should('be.called');
    // });

    // it('hard refreshes on links to external domains', function() {
    //   cy.visit('/');
    //   cy.contains('External Link').click();
    //   cy.get(qsIsLoading).should('not.exist');
    // });

    it('hard refreshes with data-swap=false', function() {
      cy.visit('/');
      cy.contains('Hard Delay').click();
      cy.get(qsIsLoading).should('not.exist');
      cy.url().should('include', '/delayed');
      cy.title().should('equal', 'Delayed');
      cy.get('.header').should('contain', 'Header');
      cy.get('.content').should('contain', 'Delayed page');
    });

    context("data-swap elements don't exist", function() {
      it('swaps the full page', function() {
        cy.visit('/');
        cy.contains('About Header').click();
        cy.url().should('include', '/about');
        cy.title().should('equal', 'About');
        cy.get('.header').should('contain', 'Header');
        cy.get('.content').should('contain', 'About page');
      });
    });

    context("some data-swap elements exist but some don't", function() {
      it('swaps the full page', function() {
        cy.visit('/');
        cy.contains('About Elements').click();
        cy.url().should('include', '/about');
        cy.title().should('equal', 'About');
        cy.get('.header').should('contain', 'Header');
        cy.get('.content').should('contain', 'About page');
      });
    });
  });

  describe('Swapping specific elements', function() {
    it('swaps a specific element', function() {
      cy.visit('/');
      cy.contains('About Body').click();
      cy.url().should('include', '/about');
      cy.title().should('equal', 'About');
      cy.get('.content').should('contain', 'About page');
      cy.get('.header').should('contain', 'Home Header');
    });

    it('swaps a specific elements', function() {
      cy.visit('/');
      cy.contains('About Header and Body').click();
      cy.url().should('include', '/about');
      cy.title().should('equal', 'About');
      cy.get('.header').should('contain', 'Header');
      cy.get('.content').should('contain', 'About page');
    });
  });

  describe('Links with operators', function() {
    it('innerHtml swap', function() {
      cy.visit('/operators');
      cy.get('.content').should('contain', 'Content');
      cy.get('.content').should('not.contain', 'Header');
      cy.contains('InnerHtml Swap').click();
      cy.get('.content').should('not.contain', 'Content');
      cy.get('.content').should('contain', 'Header');
    });

    it('append swap', function() {
      cy.visit('/operators');
      cy.get('.content').should('exist');
      cy.get('.header').should('not.exist');
      cy.contains('Append Swap').click();
      cy.get('.content').should('exist')
      cy.get('.header').should('exist');
    });

    it('replace adjacent swap', function() {
      cy.visit('/operators');
      cy.get('.content').should('exist');
      cy.get('.header').should('not.exist');
      cy.contains('Replace Adjacent Swap').click();
      cy.get('.content').should('not.exist')
      cy.get('.header').should('exist');
    });
  });

  describe('Inline swapping', function() {
    it('swaps content without changing the url', function() {
      cy.visit('/');
      cy.contains('Inline About').click();
      cy.url().should('not.include', '/about');
      cy.title().should('not.equal', 'About');
      cy.get('.content').should('contain', 'About page');
      cy.get('.header').should('contain', 'Home Header');
    });
  });

  describe('swap methods', function() {
    it('Posts data on buttons', function() {
      cy.visit('/form-method');
      cy.contains('Post Data').click();

      cy.get('.content').should('contain', 'Posted name = charles');
    });

    it('posts data on links', function() {
      cy.visit('/form-method');
      cy.contains('Link Data').click();

      cy.get('.content').should('contain', 'Posted name = charles');
    });

    it('can use other methods besides post', function() {
      cy.visit('/form-method');
      cy.contains('Put Data').click();

      cy.get('.content').should('contain', 'Put name = john');
    });

    it('swaps elements on buttons', function() {
      cy.visit('/form-method');
      cy.contains('Swap Data').click();

      cy.get('.content').should('contain', 'Posted name = martin');
      cy.get('h1').should('contain', 'Button links');
    });

    it('swaps elements on links', function() {
      cy.visit('/form-method');
      cy.contains('Swap Link Data').click();

      cy.get('.content').should('contain', 'Posted name = augustine');
      cy.get('h1').should('contain', 'Button links');
    });

    it('does a full page load on different domain', function() {
      cy.visit('/form-method');
      cy.contains('Swap Other Domain').click();

      cy.get('.content').should('contain', 'Other domain');
      cy.get('h1').should('not.exist');
    });

    it('swaps inline', function() {
      cy.visit('/form-method');
      cy.contains('Swap Data Inline').click();

      cy.get('.content').should('contain', 'Posted name = jones');
      cy.get('h1').should('contain', 'Button links');
      cy.url().should('include', '/form-method');
    });

    it('swaps in a pane', function() {
      cy.visit('/form-method');
      cy.contains('Pane').click();
      cy.contains('Pane Post Data').click();

      cy.get(qsPaneContent).should('contain', 'Posted name = charles');
    });

    it('swaps in a save and continue', function() {
      cy.visit('/form-method');
      cy.contains('Pane').click();
      cy.contains('Edit Account').click();
      cy.contains('Save and Continue').click();

      cy.get(qsPaneContent).should('contain', 'Account Info');
    });
  });
});
