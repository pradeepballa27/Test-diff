resource "google_bigtable_instance" "production-instance" {
  name                = "${var.bigtable_name}-${var.random_id}"
  deletion_protection = false

  # A cluster with fixed number of nodes.
  cluster {
    cluster_id   = "tf-instance-cluster1"
    num_nodes    = 1
    storage_type = "HDD"
    zone         = "us-central1-c"
  }

  # a cluster with auto scaling.
  cluster {
    cluster_id   = "tf-instance-cluster2"
    storage_type = "HDD"
    zone         = "us-central1-b"
    autoscaling_config {
      min_nodes  = 1
      max_nodes  = 3
      cpu_target = 50
    }
  }

  labels = {
    my-label = "prod-label"
  }
}
