#!/bin/zsh
SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR" || exit 1

PORT=4173
URL="http://127.0.0.1:${PORT}/pencil-canvas-v8.html"

python3 -m http.server "$PORT" --bind 127.0.0.1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null' EXIT INT TERM

for attempt in {1..30}; do
  if curl --silent --fail --output /dev/null "$URL"; then
    echo "Pencil prototype is running at:"
    echo "$URL"
    open "$URL"
    wait "$SERVER_PID"
    exit $?
  fi
  sleep 0.2
done

echo "Could not start the prototype on port $PORT."
echo "If another process is using that port, close it and try again."
kill "$SERVER_PID" 2>/dev/null
read "?Press Enter to close…"
exit 1
