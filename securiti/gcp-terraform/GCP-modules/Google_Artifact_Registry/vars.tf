variable "region" {
  description = "Google Cloud region"
  type        = string
  default     = "us-west2"
}

variable "location" {
  type    = string
  default = "us-west1"
}

variable "repository_id" {
  type    = string
  default = "securiti-terraform-repository22"
}

variable "description" {
  type    = string
  default = "example docker repository"
}

variable "format" {
  type    = string
  default = "DOCKER"
}

variable "random_id" {}
