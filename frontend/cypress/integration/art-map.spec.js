import queries from "../../src/pages/ArtMap/queries";
import { client } from "../../src/graphql-config";
describe("Art Map", () => {
  beforeEach(cy.login);
  it("Allows users to claim art.", async () => {
    const rawArtData = await client.query({ query: queries.getArtworks });
    const works = rawArtData.data.artwork.edges.map(
      ({ node: { title, id, rating, location } }) => ({
        id,
        title,
        coordinates: [...location.coordinates],
        rating: (Math.round(rating) / 100) * 5,
      })
    );

    const targetWork = works[0];
    const targetLocation = {
      latitude: targetWork.coordinates[0],
      longitude: targetWork.coordinates[1],
    };

    cy.visit("http://localhost:3000/map/" + targetWork.id, {
      onBeforeLoad(win) {
        cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake(
          (callback) => {
            return callback({ coords: targetLocation });
          }
        );
      },
    });
    cy.wait(1000);
    cy.get("button").contains("Let's Go").click();
    const geolocatorButton =
      "#app-screen > article > div > div.mapboxgl-control-container > div.mapboxgl-ctrl-top-right > div > button";
    cy.get(geolocatorButton).click();
    cy.wait(5000);
    cy.get("button").contains("Add to Portfolio").click();
    cy.url().should("include", "/artwork");
    cy.visit("http://localhost:3000/portfolio");
    cy.url().should("include", "/portfolio");
    cy.get("h2.title").contains(targetWork.title);
  });

  it("Allows users to exit when art isn't found.", async () => {
    cy.visit("http://localhost:3000/map/QXJ0d29ya1R5cGU6RmlyZSBXYWxs/track");
    cy.wait(700); // for animation
    const closeButton = "#app-screen > article > aside > button";
    cy.get(closeButton).click();
  });
});
