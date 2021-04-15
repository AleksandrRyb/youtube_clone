import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";

export function formatCreatedAt(timestump) {
  return formatDistanceToNowStrict(new Date(timestump), {
    addSuffix: true,
  });
}
