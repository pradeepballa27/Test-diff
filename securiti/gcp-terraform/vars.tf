variable "project" {
  description = "Google Project ID."
  type        = string
  default     = "gcpproject2-313500"
}

variable "region" {
  description = "Google Cloud region"
  type        = string
  default     = "us-west2"
}

variable "json-cred-file" {
  description = "JSON Credentials file"
  default     = "gcpproject2-313500-4ee7a772c37b.json"
}

variable "dataset_id" {
  description = "name of the redis instance"
  type        = string
  default     = "foo"
}

variable "table_id" {
  description = "name of the redis instance"
  type        = string
  default     = "bar"
}

variable "bigtable_name" {
  description = "name of the redis instance"
  type        = string
  default     = "securiti-tf-instance"
}

variable "logging_name" {
  description = "name of the redis instance"
  type        = string
  default     = "my-pubsub-instance-sink"
}

variable "dataplex_lake_name" {
  description = "name of the redis instance"
  type        = string
  default     = "test-lake"
}

variable "machine_type" {
  default = "n1-standard-4"
}

variable "master_boot_disk_type" {
  default = "pd-standard"
}

variable "min_cpu_platform" {
  default = "Intel Skylake"
}

variable "image_version" {
  default = "2.0.19-debian10"
}

variable "eventarc_name" {
  description = "name of the redis instance"
  type        = string
  default     = "eventarc_trigger"
}

variable "redis_name" {
  description = "name of the redis instance"
  type        = string
  default     = "memory-store-instance"
}

variable "authorized_network" {
  description = "name of the redis tier"
  type        = string
  default     = "default"
}

variable "alert_email" {
  description = ""
  type        = string
  default     = "devops@securiti.ai"
}

variable "topic_name" {
  description = "name of the redis instance"
  type        = string
  default     = "example-topic"
}

variable "storage_class" {
  description = "Bucket storage class."
  type        = string
  default     = "STANDARD"
}

variable "bucket_name" {
  description = "name of the GCS bucket"
  type        = string
  default     = "securiti-terraform"
}

# variable "random_id" {
# }



variable "Bigquery" {
}

variable "Bigtable" {
}

variable "Cloud_Logging" {
}

variable "Dataplex" {
}

variable "Dataproc-cluster" {
}

variable "Eventarc" {
}

variable "Google_Artifact_Registry" {
}

variable "Google_MemoryStore" {
}

variable "Pub-Sub" {
}

variable "VPC-Networks" {
}

