//Specify the GCP Provider
provider "google" {
  credentials = file(var.json-cred-file)
  project     = var.project
  region      = var.region
}

//google-beta provider is using by google Artifact Registry
provider "google-beta" {
  credentials = file(var.json-cred-file)
  project     = var.project
  region      = var.region
}
