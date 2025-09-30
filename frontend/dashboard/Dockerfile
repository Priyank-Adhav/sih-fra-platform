FROM node:22-alpine
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy everything (but we'll override with volume in docker-compose)
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
