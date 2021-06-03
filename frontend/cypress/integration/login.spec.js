describe("Login Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });
  it("Allows user to log in successfully when auth is correct.", () => {
    cy.url().should("include", "/login");
    cy.get("#email").type("john@john.com");
    cy.get("#password").type("testing123");
    const submitButton = cy.get(".submit-button");
    submitButton.click();
    submitButton.should("be.disabled");
    cy.url().should("include", "/map");
  });

  it("Denys users when the incorrect auth is entered.", () => {
    cy.url().should("include", "/login");
    cy.get("#email").type("john@john.com");
    cy.get("#password").type("foo");
    const submitButton = cy.get(".submit-button");
    submitButton.click();
    cy.url().should("include", "/login");
  });
});
