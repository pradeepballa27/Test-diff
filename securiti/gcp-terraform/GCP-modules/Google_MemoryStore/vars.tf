variable "redis_name" {
}

variable "authorized_network" {
}

variable "memory_size_gb" {
  description = "memory size in GiB"
  default     = 8
}

variable "redis_version" {
  description = "the version of Redis software"
  default     = "REDIS_5_0"
}

variable "tier" {
  description = "the service tier of the instance"
  default     = "BASIC"
}

variable "transit_encryption_mode" {
  default     = "SERVER_AUTHENTICATION"
  description = "Enable TLS"
}

variable "enable_auth" {
  description = "Auth token for password protecting redis, transit_encryption_mode must be set to 'true'! Password must be longer than 16 chars"
  default     = "true"
}

variable "stream-node-max-bytes" {
  description = "parameter designates the maximum number of bytes available to store items in a single tree node"
  default     = "4096"
}

variable "stream-node-max-entries" {
  description = "parameter designates the number of items that can be stored in a single node"
  default     = "100"
}

variable "connect_mode" {
  default     = "DIRECT_PEERING"
  description = "Service Connection mode"
}

variable "alert_email" {
}

variable "random_id" {}
