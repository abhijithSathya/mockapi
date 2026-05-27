import test from "node:test";
import assert from "node:assert/strict";
import { handleHttpRequest, resetState } from "../src/mock-api-core.mjs";

test("OpenAPI spec exposes forecasting workforce operations", async () => {
  const response = await handleHttpRequest(new Request("http://localhost/openapi.json", { method: "GET" }));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.swagger, "2.0");
  assert.equal(body.paths["/forecasting/workforce/recommendation-candidates"].post.operationId, "get_workforce_recommendation_candidates");
  assert.equal(body.paths["/forecasting/workforce/resource-move-batches"].post.operationId, "create_idle_time_resource_move_batch");
});

test("landing recommendation candidates do not require capacity areas", async () => {
  resetState();
  const body = await post("/forecasting/workforce/recommendation-candidates", { limit: 3 });
  assert.equal(body.items.length, 3);
  assert.equal(body.items[0].capacityArea, "FL");
  assert.equal(body.items[0].issueType, "TIME_TO_START");
  assert.ok(body.items[0].metricSnapshots.length > 0);
});

test("metric values require a selected capacity area", async () => {
  const response = await request("/forecasting/workforce/metric-values", {});
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.errorCode, "CAPACITY_AREA_REQUIRED_OR_NOT_FOUND");
});

test("hire proposal save is persisted and searchable", async () => {
  resetState();
  const saved = await post("/forecasting/workforce/hire-proposals", {
    capacityArea: "FL",
    issueType: "TIME_TO_START",
    selectedOptionIds: ["FL-HIRE-001"],
    proposalText: "workflow generated text",
    userContext: { userId: "USER_TEST", userName: "Planner Test" }
  });
  assert.equal(saved.statusCode, "SAVED");

  const search = await post("/forecasting/workforce/hire-proposals/search", { capacityArea: "FL", statusCodes: ["SAVED"] });
  assert.ok(search.items.some((item) => item.proposalId === saved.proposalId));
  assert.equal(search.items.some((item) => Object.hasOwn(item, "proposalText")), false);
});

test("move simulation returns numeric source and target impact", async () => {
  const body = await post("/forecasting/workforce/resource-move-simulations", {
    capacityArea: "CA",
    issueType: "IDLE_TIME",
    selectedOptionIds: ["CA-MOVE-001"]
  });
  assert.equal(body.selectedResourceCount, 1);
  assert.equal(body.selectedResourceIds[0], "RES-CA-014");
  assert.ok(body.targetAreaImpacts.length > 0);
});

test("simulations can extract option IDs from submitted app payload text", async () => {
  const hire = await post("/forecasting/workforce/hire-simulations", {
    capacityArea: "FL",
    issueType: "TIME_TO_START",
    selectedResourceIds: "{\"selectedResourceIds\":[\"FL-HIRE-001\",\"FL-HIRE-002\"]}"
  });
  assert.deepEqual(hire.selectedOptionIds, ["FL-HIRE-001", "FL-HIRE-002"]);
  assert.equal(hire.selectedResourceCount, 2);

  const move = await post("/forecasting/workforce/resource-move-simulations", {
    capacityArea: "CA",
    issueType: "IDLE_TIME",
    selectedMoveOptionIds: "{\"selectedMoveOptionIds\":[\"CA-MOVE-001\"]}"
  });
  assert.deepEqual(move.selectedOptionIds, ["CA-MOVE-001"]);
  assert.equal(move.selectedResourceIds[0], "RES-CA-014");
});

async function post(path, payload) {
  const response = await request(path, payload);
  assert.equal(response.status, 200);
  return response.json();
}

function request(path, payload) {
  return handleHttpRequest(new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  }));
}
