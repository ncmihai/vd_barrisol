import * as migration_20260606_140813_initial from "./20260606_140813_initial";
import * as migration_20260606_153216_add_company_contact_fields from "./20260606_153216_add_company_contact_fields";

export const migrations = [
  {
    up: migration_20260606_140813_initial.up,
    down: migration_20260606_140813_initial.down,
    name: "20260606_140813_initial",
  },
  {
    up: migration_20260606_153216_add_company_contact_fields.up,
    down: migration_20260606_153216_add_company_contact_fields.down,
    name: "20260606_153216_add_company_contact_fields",
  },
];
