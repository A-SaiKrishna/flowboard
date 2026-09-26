describe("FLowboard home", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
  });
  it("shows the brand name", () => {
    cy.contains("flowboard").should("be.visible");
  });

  it("shows the default nodes", () => {
    cy.contains("Start").should("be.visible");
    cy.contains("Send email").should("be.visible");
    cy.contains("End").should("be.visible");
  });

  it("it shows the main toolbar actions", () => {
    cy.contains("button", "+ action").should("be.visible");
    cy.contains("button", "Undo").should("be.visible");
    cy.contains("button", "Export JSON").should("be.visible");
  });

  it("adding the action from toolabr", () => {
    cy.contains("button", "+ action").click();
    cy.get('[data-cy="flow-node-action"]')
      .filter(':contains("Action")')
      .should("have.length.at.least", 1)
      .last()
      .should("have.attr", "data-node-id")
      .and("match", /^action/);
  });

  it("undo removes the newly added action node", () => {
    cy.contains("button", "+ action").click();
    cy.get('[data-cy="flow-node-action"]')
      .filter(':contains("Action")')
      .should("have.length.at.least", 1);

    cy.contains("button", "Undo").click();

    cy.get('[data-cy="flow-node-action"]')
      .filter(":contains(Action)")
      .should("have.length", 0);
  });
});
