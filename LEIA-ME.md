Autor: Adriel Cardoso dos Santos

Localização:  

a) https://github.com/ADCDS/tvpp-log-parser 

b) https://github.com/ADCDS/TccPlots

Descrição: Software para avaliação de Logs de execução do algoritmo 2PC 

Objetivo: Avaliação da overlay gerada pelo 2PC

O sistema de análise consiste em dois softwares:

a) O **tvpp-log-parser**, que é o código em NodeJS que recebe como input os logs do TVPP e gera os grafos e outros outputs usados no TccPlots-master

b) **TccPlots**, que contém os scripts que geram os gráficos apresentados

**Sistema Operacional base:** 

Preferencialmente Linux, porém qualquer SO moderno que suporte NodeJS e Python pode executar.

## **Ambiente de implementação:** 

### **tvpp-log-parser**
Para rodar o **tvpp-log-parser** é necessário ter o NodeJS instalado e opcionalmente o git para clonar o código do GitHub.

Em uma distribuição Linux baseada no Debian, isso pode ser feito executando os seguintes comandos no terminal:

- apt-get install nodejs git # Download das ferramentas
- git clone <https://github.com/ADCDS/tvpp-log-parser.git> # Clonando o repositório
- cd tvpp-log-parser/ # Entra no diretório criado
- npm install . # Download das dependências do código
- npm install -g gulp # Download do gulp
- gulp # Inicia o webserver

Após rodar o último comando (gulp) um WebServer local será iniciado no endpoint <http://localhost:3000>. Você pode acessar essa página com qualquer navegador moderno e submeter os logs contidos no zip [2021-SBRC-LOGS.zip](https://github.com/ADCDS/tvpp-log-parser/tree/master/logs#:~:text=.%E2%80%8A.-,2021%2DSBRC%2DLOGS.zip,-add%20logs).

A tela do tvpp-log-parser é dividida em 4 partes:

![pasted image 0](https://user-images.githubusercontent.com/6514747/167742922-9f30b6a4-add9-473d-9984-22530b0edab0.png)


1. É onde você seleciona os Logs de Overlay e Performance, também escolhe o tipo de filtro de arestas. Para gerar os resultados do artigo utilizamos o filtro Yen’s KSP Filter (N-caminhos mínimos) do nó transmissor até os receptores. Note que para poder selecionar o algoritmo de filtragem de arestas, o campo Disable Edges na seção 5 deve estar desmarcado. Também é possível selecionar o tipo do Layout para visualização do grafo na seção 6, mas isso é irrelevante para os resultados obtidos no artigo.
1. Onde pode ser configurado os parâmetros do algoritmo de filtragem de arestas e o algoritmo de layout. Para os resultados obtidos no artigo usamos o filtro de arestas Yen’s KSP e a opção Number of paths=1 (Mesma coisa que o usar o filtro de arestas de Dijkstra), Number of paths=7 e Number of paths=15. É necessário rodar o tvpp-log-parser para cada valor de Number of paths, note que Number of paths é a mesma coisa que o ‘*k’* no artigo.
1. Onde é possível habilitar e desabilitar os charts que aparecerão na seção 6
1. Apenas para monitorar que parte do log estamos analisando.
1. É onde é possível iniciar/terminar a análise. Para chegar nos resultados obtidos no artigo, utilizamos apenas o botão **Extract Layer Log** que gera um arquivo JSON chamado **layer.output.json**.
1. Representação visual do grafo de peers.

Com o **layer.output.json** em mãos, submeta este arquivo em <http://localhost:3000/charts>. e clique no botão Generate Group Layer Charts.** Com isso, você obterá o **layer.pp.output.json,** que será submetido ao **TccPlots.** 


### **TccPlots**
O TccPlots exige o Python 3 e alguns pacotes.

Em uma distribuição Linux baseada no Debian, isso pode ser feito executando os seguintes comandos no terminal:

- apt-get install python pip git 
- git clone <https://github.com/ADCDS/TccPlots.git>
- pip install matplotlib scipy

O TccPlots recebe como input o JSON de distribuição de nós por camadas por tempo **layer.pp.output.json** que é uma das saídas do tvpp-log-parser. Todos os scripts nesse repositório são variações de um mesmo script. O script python usado para gerar os gráficos usados no artigo é o [article/layer_chart_plot_togheter_bezier_gaussian_filter_pct_multiple_k.py](https://github.com/ADCDS/TccPlots/blob/master/article/layer_chart_plot_togheter_bezier_gaussian_filter_pct_multiple_k.py) Esse script espera que os logs **layer.pp.output.json** estejam no diretório  

"./data/multiple\_k\_split/k=X/ layer.pp.output.json". Para os resultados obtidos no artigo temos k=1, k=7, k=15. Um diretório pra cada. os resultados saem no diretório "output/multiple\_k\_togheter/data/pct/k=X/layer” onde layer é cada camada do experimento. Nesse diretório existirá um .txt para cada classe de peer configurado. 



