export const loginUser = () => {
  cy.visit("http://localhost:3000");
  cy.url().should("include", "/login");
  cy.get("#email").type("john@john.com");
  cy.get("#password").type("testing123");
  const submitButton = cy.get(".submit-button");
  submitButton.click();
};
