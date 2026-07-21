variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Used to name/tag AWS resources"
  type        = string
  default     = "hoya-bit-frontend"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Existing EC2 key pair name for SSH access"
  type        = string
}

variable "allowed_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH in, e.g. [\"203.0.113.10/32\"]. Do not leave this as 0.0.0.0/0."
  type        = list(string)
}

variable "root_volume_gb" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 20
}

variable "assign_elastic_ip" {
  description = "Attach a stable Elastic IP so the address survives instance restarts"
  type        = bool
  default     = true
}

variable "domain_name" {
  description = "Optional domain name (for the bootstrap script's next-steps note); DNS + certbot are still manual"
  type        = string
  default     = ""
}
