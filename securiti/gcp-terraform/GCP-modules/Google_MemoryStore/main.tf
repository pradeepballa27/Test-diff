resource "google_redis_instance" "memory_store" {
  name               = "${var.redis_name}-${var.random_id}"
  tier               = var.tier
  memory_size_gb     = 1
  authorized_network = "default"
  redis_version      = var.redis_version
  auth_enabled       = var.enable_auth
  connect_mode       = var.connect_mode

  transit_encryption_mode = var.transit_encryption_mode
  redis_configs = {
    stream-node-max-bytes   = "${var.stream-node-max-bytes}"
    stream-node-max-entries = "${var.stream-node-max-entries}"
  }
}

resource "google_monitoring_notification_channel" "email" {
  display_name = "Email configured for redis alerts"
  type         = "email"

  labels = {
    email_address = var.alert_email
  }
  depends_on = [google_redis_instance.memory_store]
}

output "memory_store_instance_endpoint" {
  value = google_redis_instance.memory_store.host
}
