resource "google_pubsub_topic" "example" {
  name = "${var.topic_name}-${var.random_id}"
}

resource "google_pubsub_subscription" "example" {
  name  = "${var.name}-${var.random_id}"
  topic = google_pubsub_topic.example.name

  labels = {
    foo = "bar"
  }

  # 20 minutes
  message_retention_duration = "1200s"
  retain_acked_messages      = true

  ack_deadline_seconds = 20

  expiration_policy {
    ttl = "300000.5s"
  }
  retry_policy {
    minimum_backoff = "10s"
  }

  enable_message_ordering = false
}
