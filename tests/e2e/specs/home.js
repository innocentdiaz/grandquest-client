describe('Home page testing', () => {
  before(() => {
    cy.visit('/')
  });
  it('Contains header content', () => {
    cy.contains('.main-header__content a', 'GRANDQUEST')
  });
  it('Contains introduction content', () => {
    cy.contains('aside', 'You\'ve stumbled onto a great quest.')
  });
});