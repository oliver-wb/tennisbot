FROM mcr.microsoft.com/playwright:v1.42.1-focal

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install TypeScript globally
RUN npm install -g typescript

# Compile TypeScript
RUN tsc

# Command to run the script
CMD ["node", "dist/index.js"] 