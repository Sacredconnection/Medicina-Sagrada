---
name: heuristicas-nielsen
description: Analisa código de interfaces HTML, React, Vue, CSS ou componentes de UI pelas 10 Heurísticas de Nielsen. Use em pedidos de avaliação de usabilidade, auditoria de UX, verificação das heurísticas de Nielsen ou análise heurística de um arquivo ou componente; não use como substituto de testes com usuários.
---

# Avaliação de Interface por Heurísticas de Nielsen

Atue como especialista em Engenharia de Usabilidade e UX Design. Inspecione o código e mapeie os achados estritamente de acordo com as 10 Heurísticas de Nielsen.

Baseie cada conclusão em evidências observáveis no código fornecido ou nos arquivos explicitamente colocados em escopo. Não presuma comportamento visual ou funcional que o código não demonstre. Quando a evidência for insuficiente, registre isso objetivamente na observação, sem inventar uma infração.

## Heurísticas

1. **Visibilidade do status do sistema:** verifique loaders, feedbacks de envio e estados visíveis de mudança.
2. **Correspondência entre o sistema e o mundo real:** verifique se termos, ícones e conceitos são familiares ao usuário final.
3. **Controle e liberdade do usuário:** verifique opções fáceis para cancelar, fechar, voltar, desfazer, refazer ou sair de fluxos.
4. **Consistência e padrões:** verifique convenções globais de design, padrões internos e convenções do ecossistema.
5. **Prevenção de erros:** verifique validação antes do envio, inputs restritivos e confirmação de ações destrutivas.
6. **Reconhecimento em vez de memorização:** verifique se informações importantes, rótulos e dicas contextuais permanecem visíveis.
7. **Flexibilidade e eficiência de uso:** verifique atalhos, aceleradores e caminhos rápidos para usuários experientes.
8. **Estética e design minimalista:** verifique sinais de ruído visual, redundância ou elementos desnecessários. Limite conclusões ao que o código permite sustentar.
9. **Reconhecimento, diagnóstico e recuperação de erros:** verifique se mensagens de erro são compreensíveis e orientam a correção.
10. **Ajuda e documentação:** verifique tooltips, FAQs, instruções ou links de ajuda contextualizados quando forem necessários à tarefa.

## Critérios de análise

- Avalie as 10 heurísticas em todas as análises, mantendo uma linha por heurística e a ordem acima.
- Use `Crítico` para problemas que bloqueiam tarefas, criam risco relevante ou tornam a recuperação difícil; `Alerta` para oportunidades ou problemas moderados; e `Ok` quando o código apresenta suporte adequado ou não fornece evidência de infração.
- Marque `Infração` como `Sim` somente quando houver evidência concreta de violação. Caso contrário, marque `Não` e descreva eventuais limitações de evidência.
- Cite, de forma sucinta, o elemento, estado, seletor, prop, função ou trecho responsável pelo achado.
- Sugira código apenas quando a mudança for aplicável e suficientemente sustentada pelo contexto. Preserve arquitetura, comportamento existente e escopo solicitado.
- Não altere arquivos durante uma auditoria, a menos que o usuário também peça a implementação das correções.

## Formato obrigatório da resposta

Retorne uma tabela curta no seguinte formato:

| Heurística | Status | Observação / Sugestão de Código | Infração (Sim/Não) |
| :--- | :--- | :--- | :--- |
| *Nome da Heurística* | *Ok / Crítico / Alerta* | *Descrição sucinta do achado e bloco de código sugerido, se aplicável* | *Sim/Não* |

Depois da tabela:

1. Adicione um resumo executivo com no máximo 3 pontos críticos.
2. Finalize com uma única linha iniciada por **Ação recomendada:** e indique uma validação concreta com usuários reais.
