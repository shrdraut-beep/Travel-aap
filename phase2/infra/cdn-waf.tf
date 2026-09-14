# Google Cloud Armor (WAF) and Cloud CDN Configuration

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Primary Region"
  type        = string
  default     = "asia-south1"
}

# 1. Cloud Armor Security Policy (WAF)
resource "google_compute_security_policy" "waf_policy" {
  name        = "routtripo-waf-policy"
  description = "Basic WAF rules for RoutTripo"

  # Default deny / rate limit could be set here.
  # Using default allow for base traffic
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow"
  }

  # Block common SQL injection and XSS
  rule {
    action   = "deny(403)"
    priority = 1000
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable') || evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "Block SQLi and XSS"
  }
}

# 2. Backend Bucket or Service for CDN
resource "google_compute_backend_service" "default" {
  name                  = "routtripo-backend-service"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  enable_cdn            = true # Enable Cloud CDN
  security_policy       = google_compute_security_policy.waf_policy.self_link

  # Attach your Cloud Run NEGs here in real environments
}
