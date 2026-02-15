# 🚀 ManyChat AI Agent - Guia de Instalação (Parceiro)

Este é o código completo do Agente de IA para WhatsApp/ManyChat.
Para rodar, você precisará configurar suas próprias chaves de API.

## 1. Configuração Inicial

1.  **Instale o Node.js**: Certifique-se de ter o Node instalado.
2.  **Instale as dependências**:
    ```bash
    npm install
    ```

## 2. Configurando as Chaves (Segurança)

O arquivo de senhas originais (`src/config/secrets.js`) foi removido por segurança.
Você deve usar variáveis de ambiente.

1.  Renomeie o arquivo `.env.example` para `.env`.
2.  Abra o arquivo `.env` e coloque suas chaves:

```env
# Exemplo
GEMINI_KEYS=AIzaSy...seu_google_key...
MANYCHAT_TOKEN_ZAP1=123456:seu_manychat_token...
```

## 3. Rodando o Servidor

Para iniciar o servidor localmente:

```bash
npm start
```

Ou para desenvolvimento (reinicia ao salvar):

```bash
npm run dev
```

## 4. Deploy (Render/Replit)

Se for subir no Render.com:
1.  Crie um novo Web Service.
2.  Conecte este repositório.
3.  Nas **Environment Variables** (Variáveis de Ambiente), adicione as mesmas chaves que você colocou no `.env`.

**Dúvidas?**
Entre em contato com o desenvolvedor original.
