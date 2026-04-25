import { orderEAPlan, orderWMPlan } from "./orderFunctions";

export const supplierToOrderFunction = {
    "WM": orderWMPlan,
    "EA": orderEAPlan
}

export class WorldmoveApiError extends Error {
  constructor(status, body) {
    super(`Worldmove API error: ${status}`);
    this.name = "WorldmoveApiError";
    this.status = status;
    this.body = body;
  }
}

export class WorldmoveRejectionError extends Error {
  constructor(code, body) {
    super(`Worldmove API error: ${code}`);
    this.name = "WorldmoveRejectionError";
    this.code = code;
    this.body = body;
  }
}

export class EsimAccessApiError extends Error {
  constructor(status, body) {
    super(`Esim Access API error: ${status}`);
    this.name = "EsimAccessApiError";
    this.status = status;
    this.body = body;
  }
}

export class EsimAccessRejectionError extends Error {
  constructor(code, body) {
    super(`Esim Access API error: ${code}`);
    this.name = "EsimAccessRejectionError";
    this.code = code;
    this.body = body;
  }
}