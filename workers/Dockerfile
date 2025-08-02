FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY live_worker.py .

# Set environment to production
ENV PYTHONUNBUFFERED=1

# Run the worker
CMD ["python", "live_worker.py"]