# Create a VPC network
resource "google_compute_network" "vpc" {
  name                    = "${var.bucket_name}-${var.random_id}-vpc"
  auto_create_subnetworks = "true"
}

# create a compute Firewall
resource "google_compute_firewall" "securiti-terraform-firewall" {
  name          = "${var.bucket_name}-${var.random_id}-firewall"
  network       = google_compute_network.vpc.name
  source_ranges = ["0.0.0.0/0"]
  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "tcp"
    ports    = ["22", "6379"]
  }
}
