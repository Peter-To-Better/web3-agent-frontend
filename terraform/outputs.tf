locals {
  public_ip = var.assign_elastic_ip ? aws_eip.web[0].public_ip : aws_instance.web.public_ip
}

output "instance_id" {
  value = aws_instance.web.id
}

output "public_ip" {
  value = local.public_ip
}

output "ssh_command" {
  value = "ssh -i <path-to-${var.key_name}.pem> ubuntu@${local.public_ip}"
}
