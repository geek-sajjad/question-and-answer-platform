FROM node:22-alpine

RUN npm i -g pnpm


WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source code and startup script
COPY . .
COPY start.sh ./
RUN chmod +x start.sh

# Build the application
RUN pnpm run build

EXPOSE 8000
CMD ["./start.sh"]