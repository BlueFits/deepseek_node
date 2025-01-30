FROM node:20.11.0 AS build

WORKDIR /usr/src/app

# Copy only package files first (improves build caching)
COPY package.json .

# Ensure dependencies are installed for the correct architecture
RUN npm install --arch=x64 --platform=linux

# Install mpv and ffmpeg
RUN apt-get update && \
    apt-get install -y mpv ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the rest of the project files
COPY . .

# Expose the application port
EXPOSE ${PORT:-3000}

# Run the application
CMD ["npm", "start"]