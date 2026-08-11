# Cosa Nostra — Help Board

> Sistema de pedidos de ajuda para a guilda Cosa Nostra (Dofus)

## Funcionalidades

- Login e cadastro de membros com personagens e classes do Dofus
- Criação de pedidos de ajuda
- Votação de dificuldade (1-10) com barra visual Gobbal → Royal Gobbal
- Aceitação de ajuda por outros membros
- Finalização com seleção de quem realmente ajudou
- Ranking de quem mais ajudou e quem mais foi ajudado
- Busca de membros por nome, telefone, personagem ou classe
- Dark mode / Light mode com cores temáticas da guilda

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Firebase (Auth + Firestore)
- GitHub Pages (hosting)

## Setup

```bash
npm install
cp .env.example .env
# Preencha as credenciais do Firebase no .env
npm run dev
```

## Deploy

Push na branch `main` dispara deploy automático via GitHub Actions para GitHub Pages.
