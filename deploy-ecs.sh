#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

AWS_PROFILE="${AWS_PROFILE:-poc}"
AWS_REGION="${AWS_REGION:-ap-northeast-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-hoya-bit-frontend}"
ECS_CLUSTER="${ECS_CLUSTER:-hoya-bit-frontend}"
ECS_SERVICE="${ECS_SERVICE:-hoya-bit-frontend}"
ECS_CONTAINER_NAME="${ECS_CONTAINER_NAME:-}"
SMOKE_BASE_URL="${SMOKE_BASE_URL:-}"
SMOKE_SCHEME="${SMOKE_SCHEME:-http}"
DRY_RUN=false
CURRENT_TASK_DEF=""
NEW_TASK_DEF=""

usage() {
  cat <<'EOF'
Usage:
  ./deploy-ecs.sh <image-tag> [--dry-run]

Examples:
  ./deploy-ecs.sh v1.0.0
  ./deploy-ecs.sh prompt-sidebar-20260726 --dry-run

Optional environment overrides:
  AWS_PROFILE=poc
  AWS_REGION=ap-northeast-1
  ECR_REPOSITORY=hoya-bit-frontend
  ECS_CLUSTER=hoya-bit-frontend
  ECS_SERVICE=hoya-bit-frontend
  ECS_CONTAINER_NAME=hoya-bit-frontend
  SMOKE_BASE_URL=http://example.com
  SMOKE_SCHEME=http

The tag must be new because the ECR repository uses immutable tags.
EOF
}

log() {
  printf '\n==> %s\n' "$*"
}

warn() {
  printf '\nWARNING: %s\n' "$*" >&2
}

die() {
  printf '\nERROR: %s\n' "$*" >&2
  exit 1
}

cleanup() {
  rm -f "${SOURCE_JSON:-}" "${SKELETON_JSON:-}" "${REGISTER_JSON:-}"
}

on_error() {
  local exit_code="$1"
  local line_number="$2"
  printf '\nERROR: Deployment command failed at line %s (exit %s).\n' "$line_number" "$exit_code" >&2
  if [[ -n "${CURRENT_TASK_DEF:-}" ]]; then
    printf 'Previous task definition: %s\n' "$CURRENT_TASK_DEF" >&2
    if [[ -n "${NEW_TASK_DEF:-}" ]]; then
      printf 'To roll back manually:\n' >&2
      printf '  AWS_PROFILE=%q AWS_REGION=%q aws ecs update-service --cluster %q --service %q --task-definition %q --force-new-deployment\n' \
        "$AWS_PROFILE" "$AWS_REGION" "$ECS_CLUSTER" "$ECS_SERVICE" "$CURRENT_TASK_DEF" >&2
    fi
  fi
  exit "$exit_code"
}

trap cleanup EXIT
trap 'on_error $? $LINENO' ERR

if [[ $# -eq 0 ]]; then
  usage
  exit 1
fi

if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  usage
  exit 0
fi

IMAGE_TAG="$1"
shift

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown option: $1"
      ;;
  esac
  shift
done

if (( ${#IMAGE_TAG} > 128 )) || [[ ! "$IMAGE_TAG" =~ ^[A-Za-z0-9_][A-Za-z0-9._-]*$ ]]; then
  die "Invalid image tag '$IMAGE_TAG'. Use 1-128 characters: letters, numbers, underscore, dot, or dash."
fi

for required_command in aws node; do
  command -v "$required_command" >/dev/null 2>&1 || die "Required command not found: $required_command"
done

export AWS_PAGER=""
export AWS_CLI_AUTO_PROMPT=off

AWS_CLI=(aws --no-cli-pager --region "$AWS_REGION")
if [[ -n "$AWS_PROFILE" ]]; then
  AWS_CLI+=(--profile "$AWS_PROFILE")
fi

# Mutating AWS calls are never retried automatically because a request may
# have succeeded even if the local client loses the response.
aws_write() {
  "${AWS_CLI[@]}" "$@"
}

# Read-only AWS calls may be retried safely. This also handles transient SSO,
# network, or local AWS CLI failures without duplicating cloud resources.
aws_read() {
  local attempt output exit_code
  for attempt in 1 2 3; do
    set +e
    output="$("${AWS_CLI[@]}" "$@" 2>&1)"
    exit_code=$?
    set -e
    if [[ $exit_code -eq 0 ]]; then
      printf '%s' "$output"
      return 0
    fi
    if [[ $attempt -lt 3 ]]; then
      warn "Read-only AWS command failed (attempt $attempt/3); retrying in 2 seconds."
      sleep 2
    fi
  done
  printf '%s\n' "$output" >&2
  return "$exit_code"
}

log "Checking AWS identity and deployment resources"
if ! ACCOUNT_ID="$(aws_read sts get-caller-identity --query Account --output text 2>/dev/null)"; then
  die "AWS login is unavailable. Run: aws sso login --profile $AWS_PROFILE"
fi
[[ "$ACCOUNT_ID" =~ ^[0-9]{12}$ ]] || die "Unexpected AWS account ID: $ACCOUNT_ID"

REPOSITORY_URI="$(aws_read ecr describe-repositories \
  --repository-names "$ECR_REPOSITORY" \
  --query 'repositories[0].repositoryUri' \
  --output text)"
[[ -n "$REPOSITORY_URI" && "$REPOSITORY_URI" != "None" ]] || die "ECR repository not found: $ECR_REPOSITORY"

EXISTING_TAG="$(aws_read ecr list-images \
  --repository-name "$ECR_REPOSITORY" \
  --filter tagStatus=TAGGED \
  --query "imageIds[?imageTag=='${IMAGE_TAG}'].imageTag | [0]" \
  --output text)"
if [[ -n "$EXISTING_TAG" && "$EXISTING_TAG" != "None" ]]; then
  die "ECR tag already exists and cannot be overwritten: $IMAGE_TAG"
fi

CURRENT_TASK_DEF="$(aws_read ecs describe-services \
  --cluster "$ECS_CLUSTER" \
  --services "$ECS_SERVICE" \
  --query 'services[0].taskDefinition' \
  --output text)"
[[ -n "$CURRENT_TASK_DEF" && "$CURRENT_TASK_DEF" != "None" ]] || die "ECS service not found: $ECS_CLUSTER/$ECS_SERVICE"

SOURCE_JSON="$(mktemp /tmp/hoya-bit-task-source.XXXXXX)"
SKELETON_JSON="$(mktemp /tmp/hoya-bit-task-skeleton.XXXXXX)"
REGISTER_JSON="$(mktemp /tmp/hoya-bit-task-register.XXXXXX)"

aws_read ecs describe-task-definition \
  --task-definition "$CURRENT_TASK_DEF" \
  --include TAGS \
  --output json > "$SOURCE_JSON"

CONTAINER_NAME="$(node - "$SOURCE_JSON" "$ECS_CONTAINER_NAME" <<'NODE'
const fs = require("fs");
const source = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const requested = process.argv[3];
const definitions = source.taskDefinition?.containerDefinitions ?? [];
if (requested) {
  const matches = definitions.filter((item) => item.name === requested);
  if (matches.length !== 1) {
    console.error(`Container '${requested}' was not found exactly once in the current task definition.`);
    process.exit(1);
  }
  process.stdout.write(requested);
} else {
  if (definitions.length !== 1) {
    console.error(`Task definition has ${definitions.length} containers. Set ECS_CONTAINER_NAME explicitly.`);
    process.exit(1);
  }
  process.stdout.write(definitions[0].name);
}
NODE
)"

CPU_ARCHITECTURE="$(node - "$SOURCE_JSON" <<'NODE'
const fs = require("fs");
const source = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
process.stdout.write(source.taskDefinition?.runtimePlatform?.cpuArchitecture ?? "X86_64");
NODE
)"

case "$CPU_ARCHITECTURE" in
  ARM64)
    BUILD_PLATFORM="linux/arm64"
    ;;
  X86_64)
    BUILD_PLATFORM="linux/amd64"
    ;;
  *)
    die "Unsupported ECS CPU architecture: $CPU_ARCHITECTURE"
    ;;
esac

IMAGE_URI="${REPOSITORY_URI}:${IMAGE_TAG}"

if [[ "$DRY_RUN" != true ]]; then
  aws_read ecs register-task-definition --generate-cli-skeleton input > "$SKELETON_JSON"
  node - "$SOURCE_JSON" "$SKELETON_JSON" "$REGISTER_JSON" "$CONTAINER_NAME" "$IMAGE_URI" <<'NODE'
const fs = require("fs");
const [sourcePath, skeletonPath, outputPath, containerName, imageUri] = process.argv.slice(2);
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const skeleton = JSON.parse(fs.readFileSync(skeletonPath, "utf8"));
const current = source.taskDefinition;
const allowed = new Set(Object.keys(skeleton));
const payload = {};

for (const [key, value] of Object.entries(current)) {
  if (allowed.has(key)) payload[key] = value;
}

const matches = current.containerDefinitions.filter((item) => item.name === containerName);
if (matches.length !== 1) {
  console.error(`Container '${containerName}' was not found exactly once.`);
  process.exit(1);
}

payload.containerDefinitions = current.containerDefinitions.map((item) =>
  item.name === containerName ? { ...item, image: imageUri } : item
);

if (allowed.has("tags") && Array.isArray(source.tags) && source.tags.length > 0) {
  payload.tags = source.tags;
}

fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
NODE
fi

printf 'Account:          %s\n' "$ACCOUNT_ID"
printf 'Region:           %s\n' "$AWS_REGION"
printf 'ECR image:        %s\n' "$IMAGE_URI"
printf 'ECS service:      %s/%s\n' "$ECS_CLUSTER" "$ECS_SERVICE"
printf 'Current task def: %s\n' "$CURRENT_TASK_DEF"
printf 'Container:        %s\n' "$CONTAINER_NAME"
printf 'Build platform:   %s\n' "$BUILD_PLATFORM"

if [[ "$DRY_RUN" == true ]]; then
  log "Dry run complete; no image or AWS resource was changed"
  printf 'Planned actions:\n'
  printf '  1. Build %s\n' "$BUILD_PLATFORM"
  printf '  2. Push %s\n' "$IMAGE_URI"
  printf '  3. Register a new revision based on %s\n' "$CURRENT_TASK_DEF"
  printf '  4. Update %s/%s and wait for stability\n' "$ECS_CLUSTER" "$ECS_SERVICE"
  exit 0
fi

for required_command in docker curl; do
  command -v "$required_command" >/dev/null 2>&1 || die "Required command not found: $required_command"
done

docker info >/dev/null 2>&1 || die "Docker daemon is not available. Start Docker Desktop or OrbStack first."

log "Building Docker image"
docker build --platform "$BUILD_PLATFORM" --tag "$IMAGE_URI" .

log "Authenticating Docker to ECR"
aws_read ecr get-login-password | docker login \
  --username AWS \
  --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

log "Pushing immutable image tag"
docker push "$IMAGE_URI"

IMAGE_DIGEST="$(aws_read ecr describe-images \
  --repository-name "$ECR_REPOSITORY" \
  --image-ids "imageTag=$IMAGE_TAG" \
  --query 'imageDetails[0].imageDigest' \
  --output text)"
printf 'Pushed digest: %s\n' "$IMAGE_DIGEST"

log "Registering a new ECS task definition revision"
NEW_TASK_DEF="$(aws_write ecs register-task-definition \
  --cli-input-json "file://${REGISTER_JSON}" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)"
printf 'New task definition: %s\n' "$NEW_TASK_DEF"

log "Updating ECS service"
aws_write ecs update-service \
  --cluster "$ECS_CLUSTER" \
  --service "$ECS_SERVICE" \
  --task-definition "$NEW_TASK_DEF" \
  --force-new-deployment \
  --query 'service.{status:status,desired:desiredCount,running:runningCount,taskDefinition:taskDefinition}' \
  --output json

log "Waiting for ECS service stability"
aws_read ecs wait services-stable \
  --cluster "$ECS_CLUSTER" \
  --services "$ECS_SERVICE"

DEPLOYED_TASK_DEF="$(aws_read ecs describe-services \
  --cluster "$ECS_CLUSTER" \
  --services "$ECS_SERVICE" \
  --query 'services[0].taskDefinition' \
  --output text)"
[[ "$DEPLOYED_TASK_DEF" == "$NEW_TASK_DEF" ]] || die "Service stabilized on an unexpected task definition: $DEPLOYED_TASK_DEF"

ROLLOUT_STATE="$(aws_read ecs describe-services \
  --cluster "$ECS_CLUSTER" \
  --services "$ECS_SERVICE" \
  --query 'services[0].deployments[0].rolloutState' \
  --output text)"
printf 'Rollout state: %s\n' "$ROLLOUT_STATE"

RUNNING_TASK_ARNS="$(aws_read ecs list-tasks \
  --cluster "$ECS_CLUSTER" \
  --service-name "$ECS_SERVICE" \
  --desired-status RUNNING \
  --query 'taskArns[]' \
  --output text)"

NEW_TASK_ARN=""
for task_arn in $RUNNING_TASK_ARNS; do
  task_definition="$(aws_read ecs describe-tasks \
    --cluster "$ECS_CLUSTER" \
    --tasks "$task_arn" \
    --query 'tasks[0].taskDefinitionArn' \
    --output text)"
  if [[ "$task_definition" == "$NEW_TASK_DEF" ]]; then
    NEW_TASK_ARN="$task_arn"
    break
  fi
done
[[ -n "$NEW_TASK_ARN" ]] || die "No running task was found for $NEW_TASK_DEF"

ENI_ID="$(aws_read ecs describe-tasks \
  --cluster "$ECS_CLUSTER" \
  --tasks "$NEW_TASK_ARN" \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value | [0]' \
  --output text)"

PUBLIC_IP="None"
if [[ -n "$ENI_ID" && "$ENI_ID" != "None" ]]; then
  PUBLIC_IP="$(aws_read ec2 describe-network-interfaces \
    --network-interface-ids "$ENI_ID" \
    --query 'NetworkInterfaces[0].Association.PublicIp' \
    --output text)"
fi

BASE_URL="$SMOKE_BASE_URL"
if [[ -z "$BASE_URL" && -n "$PUBLIC_IP" && "$PUBLIC_IP" != "None" ]]; then
  BASE_URL="${SMOKE_SCHEME}://${PUBLIC_IP}:3000"
fi

if [[ -z "$BASE_URL" ]]; then
  TARGET_GROUP_ARN="$(aws_read ecs describe-services \
    --cluster "$ECS_CLUSTER" \
    --services "$ECS_SERVICE" \
    --query 'services[0].loadBalancers[0].targetGroupArn' \
    --output text)"
  if [[ -n "$TARGET_GROUP_ARN" && "$TARGET_GROUP_ARN" != "None" ]]; then
    LOAD_BALANCER_ARN="$(aws_read elbv2 describe-target-groups \
      --target-group-arns "$TARGET_GROUP_ARN" \
      --query 'TargetGroups[0].LoadBalancerArns[0]' \
      --output text)"
    LOAD_BALANCER_DNS="$(aws_read elbv2 describe-load-balancers \
      --load-balancer-arns "$LOAD_BALANCER_ARN" \
      --query 'LoadBalancers[0].DNSName' \
      --output text)"
    if [[ -n "$LOAD_BALANCER_DNS" && "$LOAD_BALANCER_DNS" != "None" ]]; then
      BASE_URL="${SMOKE_SCHEME}://${LOAD_BALANCER_DNS}"
    fi
  fi
fi

if [[ -n "$BASE_URL" ]]; then
  log "Smoke testing $BASE_URL"
  for path in / /chat /dashboard; do
    passed=false
    for attempt in 1 2 3 4 5 6 7 8 9 10 11 12; do
      if curl --fail --silent --show-error \
        --connect-timeout 5 \
        --max-time 30 \
        --output /dev/null \
        "${BASE_URL}${path}"; then
        passed=true
        break
      fi
      sleep 5
    done
    if [[ "$passed" != true ]]; then
      warn "Smoke test failed: ${BASE_URL}${path}"
      warn "The service is running, but the HTTP endpoint did not pass validation."
      printf 'Rollback command:\n' >&2
      printf '  AWS_PROFILE=%q AWS_REGION=%q aws ecs update-service --cluster %q --service %q --task-definition %q --force-new-deployment\n' \
        "$AWS_PROFILE" "$AWS_REGION" "$ECS_CLUSTER" "$ECS_SERVICE" "$CURRENT_TASK_DEF" >&2
      exit 1
    fi
    printf 'HTTP OK: %s%s\n' "$BASE_URL" "$path"
  done
else
  warn "Deployment succeeded, but no public task IP, ALB, or SMOKE_BASE_URL was available; HTTP smoke tests were skipped."
fi

log "Deployment complete"
printf 'Image:           %s\n' "$IMAGE_URI"
printf 'Digest:          %s\n' "$IMAGE_DIGEST"
printf 'Task definition: %s\n' "$NEW_TASK_DEF"
printf 'Task ARN:        %s\n' "$NEW_TASK_ARN"
if [[ -n "$BASE_URL" ]]; then
  printf 'URL:             %s\n' "$BASE_URL"
fi
