import { Controller } from "@nestjs/common";

/**
 * Base controller for anything touching PHI.
 * Currently just a marker to ensure consistency, but can be used
 * for default interceptors if we remove the global one later.
 */
@Controller()
export abstract class PhiController {}
