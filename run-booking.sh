#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Export environment variables
export REC_US_EMAIL="oliverbraly@gmail.com"
export REC_US_PASSWORD="UOzP7gKELznJBg"
export DAY_OF_WEEK="Sunday"
export EARLIEST_TIME="10:00 AM"

# Run the booking script
cd "$DIR"
/opt/homebrew/bin/node src/index.js 