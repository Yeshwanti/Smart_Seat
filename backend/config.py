 # backend/config.py
import os
# We will use python-dotenv to read variables from a .env file
from dotenv import load_dotenv 

# Load environment variables (like passwords and URLs) from the .env file
load_dotenv()

# The connection string for PostgreSQL (or your chosen database)
# os.getenv is how we retrieve the value from the .env file.
DATABASE_URL = os.getenv("DATABASE_URL")
