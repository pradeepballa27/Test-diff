resource "google_eventarc_trigger" "primary" {
  name     = "${var.eventarc_name}-${var.random_id}"
  location = "europe-west1"
  matching_criteria {
    attribute = "type"
    value     = "google.cloud.pubsub.topic.v1.messagePublished"
  }
  destination {
    cloud_run_service {
      service = google_cloud_run_service.default.name
      region  = "europe-west1"
    }
  }
  labels = {
    foo = "bar"
  }
}

resource "google_pubsub_topic" "foo" {
  name = "test-topic"
}

resource "google_cloud_run_service" "default" {
  name     = "eventarc-service"
  location = "europe-west1"

  metadata {
    namespace = "my-project-name"
  }

  template {
    spec {
      containers {
        image = "gcr.io/cloudrun/hello"
        ports {
          container_port = 8080
        }
      }
      container_concurrency = 50
      timeout_seconds       = 100
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}
