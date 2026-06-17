#!/bin/bash
# Get the absolute directory path where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Run FastAPI API Server in the background
cd "$DIR/backend"
"../sipil-env/bin/uvicorn" main:app --host 0.0.0.0 --port 8000 > "$DIR/api_server.log" 2>&1 &
cd "$DIR"

# Run streamlit using the virtual environment wrapper directly
"$DIR/sipil-env/bin/streamlit" run "$DIR/main.py"
