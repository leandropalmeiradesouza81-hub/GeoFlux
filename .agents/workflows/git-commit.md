---
description: Como fazer commit versionado e push para o GitHub
---

# Git Commit Versionado

// turbo-all

1. Verifique o status dos arquivos modificados:
```bash
git status
```

2. Adicione todos os arquivos modificados:
```bash
git add -A
```

3. Faça o commit com mensagem descritiva seguindo Conventional Commits:
```bash
git commit -m "tipo(escopo): descrição curta"
```
Tipos: feat, fix, docs, style, refactor, test, chore

4. Faça push para o GitHub:
```bash
git push origin main
```

5. Se for uma nova versão, crie a tag:
```bash
git tag -a vX.Y.Z -m "Versão X.Y.Z - descrição"
git push origin --tags
```
