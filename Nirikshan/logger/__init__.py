import logging
import os
from datetime import datetime
from from_root import from_root

# Log file name with timestamp
LOG_FILE = f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log"

# Log file path
log_path = os.path.join(from_root(), 'log', LOG_FILE)  # Create log directory path
os.makedirs(log_path, exist_ok=True)  # Create the log directory if it doesn't exist
LOG_FILE_PATH = os.path.join(log_path, LOG_FILE)  # Full path to the log file

# Logging configuration
logging.basicConfig(
    filename=LOG_FILE_PATH,  # Set the log file path
    format="[ %(asctime)s ] %(name)s - %(levelname)s - %(message)s",  # Log message format
    level=logging.INFO  # Set the logging level to INFO
)