
DIRECTORY="javascript/node_modules"

if [[ "$1" = "--rm" && -d "$DIRECTORY" ]]; then
  echo "Removing cached node_modules"
fi

if [  -d "$DIRECTORY" ]; then
    echo "exists"
fi