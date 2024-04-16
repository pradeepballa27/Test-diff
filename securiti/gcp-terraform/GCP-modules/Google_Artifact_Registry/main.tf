resource "google_artifact_registry_repository" "edss-repo" {
  provider      = google-beta
  location      = var.location
  repository_id = "${var.repository_id}-${var.random_id}"
  description   = var.description
  format        = var.format
}

