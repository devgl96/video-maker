const readline = require('readline-sync')

// Função para agregar tudo
function start () {
  // Objeto para ter todos os elementos
  const content = {};

  // Criando elementos para inserir no content
  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();

  // Função para conseguir o assunto do vídeo
  function askAndReturnSearchTerm() {
    return readline.question('Type a Wikipedia search term: ');
  }


  function askAndReturnPrefix() {
    const prefixes = ["Who is", "What is", "The history of"];
    const selectedPrefixIndex = readline.keyInSelect(prefixes);
    const selectedPrefixText = prefixes[selectedPrefixIndex];

    return selectedPrefixText;
  }

  console.log(content);
}

start();