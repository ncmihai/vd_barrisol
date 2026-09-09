import * as migration_20260606_140813_initial from "./20260606_140813_initial";
import * as migration_20260606_153216_add_company_contact_fields from "./20260606_153216_add_company_contact_fields";
import * as migration_20260909_130243_beta_completion from "./20260909_130243_beta_completion";
import * as migration_20260909_173143_image_focal_points from "./20260909_173143_image_focal_points";

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
  {
    up: migration_20260909_130243_beta_completion.up,
    down: migration_20260909_130243_beta_completion.down,
    name: "20260909_130243_beta_completion",
  },
  {
    up: migration_20260909_173143_image_focal_points.up,
    down: migration_20260909_173143_image_focal_points.down,
    name: "20260909_173143_image_focal_points",
  },
];
