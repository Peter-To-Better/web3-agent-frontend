terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Uses the account's default VPC/subnet so a single `terraform apply` is
# enough to get a reachable box — this project is meant to run on one EC2
# instance, not a bespoke network.
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "web" {
  name        = "${var.project_name}-sg"
  description = "HOYA BIT frontend: SSH + HTTP + HTTPS"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg" }
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.web.id]

  root_block_device {
    volume_size = var.root_volume_gb
    volume_type = "gp3"
  }

  # Installs Docker + Compose plugin + Nginx + Certbot only. Deploying the
  # app itself (git clone / docker compose up) is a manual follow-up step —
  # see ../DEPLOY.md — so this stays infra-only and idempotent to re-apply.
  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    domain_name = var.domain_name
  })

  tags = { Name = var.project_name }
}

resource "aws_eip" "web" {
  count    = var.assign_elastic_ip ? 1 : 0
  instance = aws_instance.web.id
  domain   = "vpc"

  tags = { Name = "${var.project_name}-eip" }
}
