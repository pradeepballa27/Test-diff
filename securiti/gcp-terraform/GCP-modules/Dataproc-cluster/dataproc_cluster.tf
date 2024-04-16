resource "google_dataproc_cluster" "mycluster" {
  name                          = "${var.name}-${var.random_id}-dataproc-cluster"
  region                        = var.region
  graceful_decommission_timeout = "120s"
  labels = {
    foo = "bar"
  }

  cluster_config {

    master_config {
      num_instances = var.master_num_instances
      machine_type  = var.machine_type
      disk_config {
        boot_disk_type    = var.master_boot_disk_type
        boot_disk_size_gb = var.master_boot_disk_size_gb
      }
    }

    worker_config {
      num_instances    = var.worker_num_instances
      machine_type     = var.machine_type
      min_cpu_platform = var.min_cpu_platform
      disk_config {
        boot_disk_size_gb = var.worker_boot_disk_size_gb
        num_local_ssds    = var.num_local_ssds
      }
    }

    preemptible_worker_config {
      num_instances = var.num_instances
    }

    # Override or set some custom properties
    software_config {
      image_version = var.image_version
      override_properties = {
        "dataproc:dataproc.allow.zero.workers" = "true"
      }
      optional_components = var.optional_components
    }

  }
}
