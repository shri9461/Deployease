#!/bin/bash
# AWS SNS Notification Script
TOPIC_ARN=$1
MESSAGE=$2
SUBJECT=$3

if [ -z "$TOPIC_ARN" ]; then
  echo "SNS Topic ARN is required."
  exit 1
fi

aws sns publish \
    --topic-arn "$TOPIC_ARN" \
    --message "$MESSAGE" \
    --subject "$SUBJECT"
