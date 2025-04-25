FROM mcr.microsoft.com/playwright:v1.42.1-focal

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and Playwright
RUN npm install && \
    npx playwright install chromium && \
    npx playwright install-deps

# Copy source code
COPY . .

# Command to run the script
CMD ["npm", "run", "start"] 