# Build stage - Node.js para máxima compatibilidade
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Instalar serve para servir arquivos estáticos
RUN npm install -g serve

# Copiar build e scripts
COPY --from=builder /app/dist ./dist
COPY entrypoint.js .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expor porta 8080
EXPOSE 8080

# Variáveis de ambiente obrigatórias
ENV NODE_ENV=production \
    VITE_SUPABASE_PROJECT_ID=towmfxficdkrgfwghcer \
    VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_avEFL6ACZyiq45REDRU2vg_7yyz-XTi \
    VITE_SUPABASE_URL=https://towmfxficdkrgfwghcer.supabase.co \
    VITE_APP_URL=https://app-zapfarma.m9uocu.easypanel.host

# Entrypoint: injetar variáveis e servir
CMD ["sh", "-c", "node entrypoint.js && serve -s dist -l 8080"]
