# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

# Gerar config.json com variáveis de ambiente do Docker
# As variáveis devem ser passadas ao build: docker build --build-arg VITE_SUPABASE_URL=... 
RUN bun run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist
EXPOSE 8000

# ENV variables padrão (podem ser override pelo Easypanel)
ENV VITE_SUPABASE_URL="https://towmfxficdkrgfwghcer.supabase.co"
ENV VITE_SUPABASE_PUBLISHABLE_KEY="sb_live_O5iF9eHqrKkxQPvASr7RvxZcTwEm1hq1nJOvTKzAZjWOjdVCM3x4zFLu5wPOhXkc8aZxGOqL7sNR0qrXEY9L"
ENV VITE_APP_URL="https://app-zapfarma.m9uocu.easypanel.host"

# Script que gera o config.json em tempo de runtime com as variáveis de ambiente
COPY <<EOF /app/generate-config-runtime.sh
#!/bin/sh
cat > /app/dist/config.json <<CONFIG
{
  "supabaseUrl": "${VITE_SUPABASE_URL}",
  "supabasePublishableKey": "${VITE_SUPABASE_PUBLISHABLE_KEY}",
  "appUrl": "${VITE_APP_URL}"
}
CONFIG
echo "✅ config.json gerado em runtime com Supabase URL: ${VITE_SUPABASE_URL}"
EOF

RUN chmod +x /app/generate-config-runtime.sh

CMD ["/bin/sh", "-c", "/app/generate-config-runtime.sh && serve -s dist -l 8000"]

