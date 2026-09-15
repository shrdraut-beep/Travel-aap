/**
 * infra/cdn-waf.tf
 *
 * Adds Cloud CDN (static assets) + Cloud Armor (WAF, sits in front of your existing
 * express-rate-limit middleware — this blocks at the network edge before requests even
 * reach your Cloud Run instances, which the app-level rate limiter can't do).
 *
 * SETUP:
 *   1. Install Terraform: https://developer.hashicorp.com/terraform/install
 *   2. Fill in the variables at the top (project ID, region, your Cloud Run service name)
 *   3. terraform init && terraform plan && terraform apply
 *
 * This assumes your Cloud Run service is already deployed and named — it wraps a Load
 * Balancer + CDN + Armor policy in front of it, it does not change the Cloud Run service itself.
 */

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  description = "Your GCP project ID"
  type        = string
}

variable "region" {
  default = "asia-southeast1"
}

variable "cloud_run_service_name" {
  description = "Name of your existing Cloud Run service (from your deploy config)"
  type        = string
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# --- Cloud Armor WAF policy ---
resource "google_compute_security_policy" "routtripo_waf" {
  name = "routtripo-waf-policy"

  # Default rule: allow everything not explicitly blocked below
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config { src_ip_ranges = ["*"] }
    }
    description = "Default allow"
  }

  # Block common SQLi/XSS patterns using Google's pre-configured WAF rules
  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      expr { expression = "evaluatePreconfiguredExpr('sqli-stable')" }
    }
    description = "Block SQL injection attempts"
  }

  rule {
    action   = "deny(403)"
    priority = "1001"
    match {
      expr { expression = "evaluatePreconfiguredExpr('xss-stable')" }
    }
    description = "Block XSS attempts"
  }

  # Edge-level rate limiting — a second layer ahead of your express-rate-limit,
  # catches distributed attacks before they consume Cloud Run instance capacity
  rule {
    action   = "throttle"
    priority = "2000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config { src_ip_ranges = ["*"] }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 300
        interval_sec = 60
      }
    }
    description = "Edge rate limit: 300 req/min per IP"
  }

  # Geo-fencing example (uncomment and adjust if you need to restrict/allow by country
  # for compliance — e.g. if RoutTripo initially only serves India + a specific expansion market)
  # rule {
  #   action   = "deny(403)"
  #   priority = "500"
  #   match {
  #     expr { expression = "'[BLOCKED_COUNTRY]' == origin.region_code" }
  #   }
  #   description = "Block traffic from [country]"
  # }
}

# --- Serverless NEG pointing at your existing Cloud Run service ---
resource "google_compute_region_network_endpoint_group" "routtripo_neg" {
  name                  = "routtripo-neg"
  region                = var.region
  network_endpoint_type = "SERVERLESS"
  cloud_run {
    service = var.cloud_run_service_name
  }
}

# --- Backend service: CDN + Armor attach here ---
resource "google_compute_backend_service" "routtripo_backend" {
  name                  = "routtripo-backend"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  security_policy       = google_compute_security_policy.routtripo_waf.id

  enable_cdn = true
  cdn_policy {
    cache_mode  = "CACHE_ALL_STATIC"
    default_ttl = 3600
    client_ttl  = 3600
    max_ttl     = 86400
    # Never cache API responses — only static assets (JS/CSS/images/fonts) should hit CDN.
    # Your React build output under /assets/ is what this targets; /api/* should bypass CDN.
    negative_caching = true
  }

  backend {
    group = google_compute_region_network_endpoint_group.routtripo_neg.id
  }
}

# --- URL map: cache static assets at the edge, pass /api/* straight through ---
resource "google_compute_url_map" "routtripo_url_map" {
  name            = "routtripo-url-map"
  default_service = google_compute_backend_service.routtripo_backend.id

  path_matcher {
    name            = "api-bypass"
    default_service = google_compute_backend_service.routtripo_backend.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.routtripo_backend.id
      # route_action here could disable CDN caching specifically for /api/* if you split
      # into two backend services later (one cached, one not) — for now cdn_policy's
      # cache_mode already restricts caching to static content by content-type.
    }
  }

  host_rule {
    hosts        = ["routtripo.com", "www.routtripo.com"]
    path_matcher = "api-bypass"
  }
}

output "load_balancer_ip_instructions" {
  value = "After apply, create a global forwarding rule + managed SSL cert pointing at google_compute_url_map.routtripo_url_map — see: https://cloud.google.com/load-balancing/docs/https/setting-up-https-serverless"
}
