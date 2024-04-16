resource "google_dataplex_zone" "primary" {
  discovery_spec {
    enabled = false
  }

  lake     = google_dataplex_lake.basic.name
  location = "us-west1"
  name     = "zone"

  resource_spec {
    location_type = "MULTI_REGION"
  }

  type         = "RAW"
  description  = "Zone for DCL"
  display_name = "Zone for DCL"
  labels       = {}
  project      = "my-project-name"
}

resource "google_dataplex_lake" "basic" {
  location     = "us-west1"
  name         = "${var.dataplex_lake_name}-${var.random_id}"
  description  = "Lake for DCL"
  display_name = "Lake for DCL"

  labels = {
    my-lake = "exists"
  }

  project = var.project
}
