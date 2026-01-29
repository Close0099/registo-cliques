# Registo de Cliques com Contador Diário

Aplicação web simples (Flask + SQLite) para registar cliques em quatro botões. Cada clique grava:
- Botão clicado
- Número sequencial do dia (reinicia automaticamente a cada dia)
- Data (YYYY-MM-DD)
- Hora e minutos (HH:MM)

## Como funciona
- O front-end (HTML/CSS/JS) envia um POST para `/api/click` com o nome do botão.
- O back-end em Flask calcula o próximo número sequencial do dia e grava o registo na base `clicks.db`.
- O resultado (número, data e hora) é devolvido ao browser e mostrado no cartão lateral.

## Requisitos
- Python 3.10+
- Dependências listadas em `requirements.txt`

## Executar localmente
1. Criar ambiente virtual (Windows):
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```
2. Instalar dependências:
   ```bash
   pip install -r requirements.txt
   ```
3. Iniciar a aplicação:
   ```bash
   python app.py
   ```
4. Abrir no browser: [http://localhost:5000](http://localhost:5000)

A base de dados `clicks.db` é criada automaticamente na primeira execução.

## Estrutura
- `app.py`: servidor Flask e API `/api/click`
- `templates/index.html`: página principal com os quatro botões
- `static/style.css` e `static/script.js`: estilos e lógica de front-end
- `clicks.db`: base de dados SQLite criada em runtime

## Deploy no Replit
- Importar o repositório do GitHub para o Replit.
- Certificar que o comando de execução é `python app.py` (ou `flask run` se configurar `FLASK_APP=app.py`).
- O servidor está preparado para ouvir em `0.0.0.0` e usa a porta definida em `PORT` (ou 5000 por omissão).

## Endpoints
- `GET /` — página principal
- `POST /api/click` — regista um clique; corpo JSON `{ "button": "Botão 1" }`
- `GET /api/health` — verificação simples de estado
