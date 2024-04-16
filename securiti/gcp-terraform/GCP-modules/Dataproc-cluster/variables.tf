variable "region" {
}

variable "random_id" {}

variable "name" {
  type    = string
  default = "securiti"
}

variable "machine_type" {
}

variable "master_boot_disk_type" {
}

variable "min_cpu_platform" {
}

variable "image_version" {
}

variable "num_instances" {
  default = "0"
}

variable "master_num_instances" {
  default = "1"
}

variable "master_boot_disk_size_gb" {
  default = "50"
}

variable "worker_num_instances" {
  default = "2"
}

variable "worker_boot_disk_size_gb" {
  default = "30"
}

variable "num_local_ssds" {
  default = "1"
}

variable "optional_components" {
  default = ["ZOOKEEPER", "DOCKER"]
}
