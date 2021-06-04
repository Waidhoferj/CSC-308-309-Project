describe("Group invites allow users to join a group portfolio.", () => {
  it("Allows users who are logged in to join groups via url.", () => {
    cy.login();

    cy.visit("http://localhost:3000/group/R3JvdXBUeXBlOldlc3QgQ29hc3QgQXJ0");
    cy.get("h1").contains("West Coast Art");
    cy.visit("http://localhost:3000/groups");
    cy.get("h2").contains("West Coast Art");
  });

  it("Redirects users to login when they are unauthenticated.", () => {
    cy.visit("http://localhost:3000/group/R3JvdXBUeXBlOldlc3QgQ29hc3QgQXJ0");
    cy.url().should("include", "/login");
  });
});
