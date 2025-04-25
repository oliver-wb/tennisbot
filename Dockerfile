FROM mcr.microsoft.com/playwright:v1.42.1-focal

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Command to run the script
CMD ["npm", "run", "start"] 