#!/bin/bash
# Get the absolute directory path where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Run streamlit using the virtual environment wrapper directly
"$DIR/sipil-env/bin/streamlit" run "$DIR/main.py"
