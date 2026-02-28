# ManyChat AI Agent (Dra. Adriele) - VERSÃO FINAL CLOUD

**Data:** 07/02/2026
**Status:** 🟢 Online no Render (Cloud)

---

## 📂 O que tem neste backup?
Este arquivo contém todo o "cérebro" do seu robô de vendas.
Se o seu computador pifar ou o servidor nuvem apagar, você usa este arquivo para colocar tudo no ar de novo.

## 🚀 Como colocar no ar (Restore)

### 1. No seu Computador (Teste Local)
1.  Descompacte este arquivo.
2.  Abra o terminal na pasta.
3.  Instale as dependências:
    ```bash
    npm install
    ```
4.  Ligue o robô:
    ```bash
    npm start
    ```

### 2. Na Nuvem (Render/Railway)
1.  Crie um repositório no GitHub.
2.  Suba estes arquivos.
3.  Conecte no Render.com.
4.  Coloque as Chaves Secretas (Environment Variables):
    *   `GEMINI_API_KEY`: (Sua chave do Google)
    *   `MANYCHAT_API_TOKEN`: (Seu token do ManyChat)

---

## 🤖 Comandos Úteis

*   **Testar Conversa:** `node simulate_conversation.js`
*   **Reiniciar Servidor:** `./restart_server.sh`

---

## 📞 Suporte
Se precisar alterar o preço ou o texto, edite o arquivo:
`src/config/prompt.js`

Boas vendas! 💰
