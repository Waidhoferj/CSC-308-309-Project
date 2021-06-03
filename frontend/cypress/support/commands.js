// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
Cypress.Commands.add(
  "login",
  (email = "john@john.com", password = "testing123") => {
    cy.visit("http://localhost:3000");
    cy.get("#email").type("john@john.com");
    cy.get("#password").type("testing123");
    const submitButton = cy.get(".submit-button");
    submitButton.click();
    cy.url().should("include", "/map");
  }
);
Cypress.Commands.add("preserveCookies", () => {
  cy.getCookies().then((cookies) => {
    const namesOfCookies = cookies.map((c) => c.name);
    Cypress.Cookies.preserveOnce(...namesOfCookies);
  });
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
