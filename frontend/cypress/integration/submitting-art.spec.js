describe("Original art submissions by users via the ArtSubmission screen", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("http://localhost:3000/camera");
    cy.wait(500);
    cy.get(".snapshot-button").click();
    const submitButton =
      "#app-screen > section > article > ul > li:nth-child(3) > button";

    cy.get(submitButton).should("not.be.disabled");
    cy.get(submitButton).click();
    cy.url().should("include", "/art-submission");
  });

  it("Accepts new artwork when the user fills out the forms correctly.", () => {
    cy.get("input[name=title]").type("Test Artwork");
    const fifthStar =
      "#app-screen > section > form > label:nth-child(2) > div > div > span:nth-child(5)";
    cy.get(fifthStar).click();
    cy.get(".art-tags > input").type("tag");
    cy.get(".art-tags > button").click();
    cy.get("textarea").type("This is cool, check it out!");
    cy.get("#postArt").click();
    cy.url().should("include", "/artwork");
  });

  it("Denys users when a form input is skipped.", () => {
    cy.get("#postArt").click();
    cy.url().should("include", "/art-submission");
  });
});
