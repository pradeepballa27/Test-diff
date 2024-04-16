resource "random_id" "instance_id" {
  byte_length = 4
}

locals {
  random_id = random_id.instance_id.hex
}

module "Bigquery" {
  source     = "./GCP-modules/Bigquery"
  count      = var.Bigquery ? 1 : 0
  dataset_id = var.dataset_id
  table_id   = var.table_id
  random_id  = local.random_id
}

module "Bigtable" {
  source        = "./GCP-modules/Bigtable"
  count         = var.Bigtable ? 1 : 0
  bigtable_name = var.bigtable_name
  random_id     = local.random_id
}

module "Cloud_Logging" {
  source       = "./GCP-modules/Cloud_Logging"
  count        = var.Cloud_Logging ? 1 : 0
  logging_name = var.logging_name
  random_id    = local.random_id
}

module "Dataplex" {
  source             = "./GCP-modules/Dataplex"
  count              = var.Dataplex ? 1 : 0
  dataplex_lake_name = var.dataplex_lake_name
  project            = var.project
  random_id          = local.random_id
}

module "Dataproc-cluster" {
  source                = "./GCP-modules/Dataproc-cluster"
  count                 = var.Dataproc-cluster ? 1 : 0
  region                = var.region
  machine_type          = var.machine_type
  master_boot_disk_type = var.master_boot_disk_type
  min_cpu_platform      = var.min_cpu_platform
  image_version         = var.image_version
  random_id             = local.random_id
}

module "Eventarc" {
  source        = "./GCP-modules/Eventarc"
  count         = var.Eventarc ? 1 : 0
  eventarc_name = var.eventarc_name
  random_id     = local.random_id
}

module "Google_Artifact_Registry" {
  count     = var.Google_Artifact_Registry ? 1 : 0
  source    = "./GCP-modules/Google_Artifact_Registry"
  random_id = local.random_id
}

module "Google_MemoryStore" {
  count              = var.Google_MemoryStore ? 1 : 0
  source             = "./GCP-modules/Google_MemoryStore"
  redis_name         = var.redis_name
  authorized_network = var.authorized_network
  alert_email        = var.alert_email
  random_id          = local.random_id
}

module "Pub-Sub" {
  count      = var.Pub-Sub ? 1 : 0
  source     = "./GCP-modules/Pub-Sub"
  random_id  = local.random_id
  topic_name = var.topic_name
}

module "VPC-Networks" {
  count         = var.VPC-Networks ? 1 : 0
  source        = "./GCP-modules/VPC-Networks"
  random_id     = local.random_id
  storage_class = var.storage_class
  bucket_name   = var.bucket_name
}
