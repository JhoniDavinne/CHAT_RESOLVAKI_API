function Chat() {
  return {
  
    message: document.querySelector('.message-input'),
    submit: document.querySelector('.message-submit'),
    $messages: $('.messages-content'),//variavel com dependencia jquery, para o mCustomScrollbar
    /**
     * Inicia o chatbot.
     *
     * Inicializa o mCustomScrollbar, começa o chat com a primeira mensagem 
     * e configura o listener para a entrada do usuário.
     */
    start() {
      this.$messages.mCustomScrollbar();
      this.listener();
      this.firstMessage();
      
    },

    /**
     * Insere o horário atual na  última mensagem inserida.
     *
     * Cria um elemento span com a classe 'timestamp' e o texto no formato
     * hora:minuto e o insere como filho do  último elemento com a classe
     * 'message'.
     */
    setDate() {
      let hora = new Date();
      let timestamp = Object.assign(document.createElement('span'), { className: 'timestamp' });
      timestamp.textContent = hora.toLocaleTimeString('pt-BR', { hour12: false}).slice(0, 5); // Retorna no formato HH:mm
      document.querySelector('.message:last-child').appendChild(timestamp);
    },

    /**
     * Adiciona listeners para os eventos de submit do chat.
     *
     * Adiciona um listener para o botão de submit e outro para o pressionamento
     * da tecla Enter.
     */
    listener() {
      this.submit.addEventListener('click', () => this.newMessageUser());

      this.message.addEventListener('keydown', e => e.key === 'Enter' ? this.newMessageUser() : false);

      const callMessager = (value, option = false) => {
        this.message.value = value;
        option ? this.newMessageUser(option) : this.newMessageUser();
      }

      document.addEventListener('click', function (e) {
        const el = e.target;
        if (el.closest('div[data_type="contrato"]')) {
          callMessager(el.id, 'detalhes');
        };
        if (el.closest('div[data_type="option"]')) {
          let msg = el.id == 1 ? 'opções de pagamento' : 'acordo';
          callMessager(msg);
        };

        if (el.closest('div[data_type="divida"]')) {
          console.log(el.id)
          callMessager(el.id, 'opt_pagamento');
        };


      }.bind(this))
    },

    newMessageUser(option = false) {
      let msg = this.message.value;

      if (msg.trim() === '')
        return false;
      
      let newMessage = Object.assign(document.createElement('div'), { className: "message message-personal" });
      newMessage.textContent = option == 'opt_pagamento' ? `Resumo simples para a Divida ${msg}.` : msg;

      document.querySelector('.mCSB_container').appendChild(newMessage);

      newMessage.classList.add('new');

      if (!option && msg.length > 5) this.getProcessarData(msg);
      if (option == 'opt_pagamento') this.getOptionPayment(msg);
      if (option == 'detalhes' || (!option && !isNaN(msg) && msg.trim() !== '' && msg.length < 5)) this.getDetailDebt(msg);
      

      this.setDate();

      this.message.value = '';
      this.updateScrollbar();
    },
   
    /**
     * Adiciona uma mensagem ao chat.
     * 
     * @param {String} msg - Mensagem a ser adicionada.
     * @param {String} id - ID para o elemento, caso seja uma divida.
     * @param {String} tipo - Tipo da mensagem, caso seja uma option (opcoes pagamento ou acordo) ou contrato divida.
     * @param {String} classAdd - Classe adicional para o elemento.
     * 
     * Adiciona uma mensagem ao chat e remove mensagens com a classe loading.
     * Cria um elemento div com a classe 'message new' e adiciona um elemento figure com uma img
     * dentro e um span. Adiciona o msgE (Elemento div) ao container e adiciona a hora a msgE.
     * Reseta o input.
     */
    newMessage(msg, id = false, tipo = false, classAdd = false) {
      
    
      this.typingEffect();
      setTimeout(function () {
        // Remover mensagens com a classe 'loading'
        let loadingE = document.querySelectorAll('.message.loading');
        loadingE.forEach(msg => msg.remove());

        // Criar o novo elemento div (Elemento div)
        let msgE = Object.assign(document.createElement('div'), { className: "message new" });
        id ? msgE.id = id : false;
        tipo ? msgE.setAttribute('data_type', tipo) : false;
        classAdd ? msgE.classList.add(classAdd) : false;
        // Criar o elemento figure e img
        let figure = Object.assign(document.createElement('figure'), { className: 'avatar' });
        let img = Object.assign(document.createElement('img'), { src: './assets/img/sani-bot.png' });
        figure.appendChild(img);

        // Criar o span
        let span = document.createElement('span');

        // Adicionar o figure e span ao msgE (Elemento div)
        msgE.appendChild(figure);
        msgE.appendChild(span);

        // Adicionar msg a msgE (Elemento div) caso tenha algo
        msgE.innerHTML += figure.outerHTML + msg;

        // Selecionar o container e adicionar o novo elemento msgE (Elemento div)
        document.querySelector('.mCSB_container').appendChild(msgE);

        //Seta uma hora a msgE (Elemento div) pois existe uma mensagem a ser apresentada.
        this.setDate();

        //reseta o input
        this.message.value = null;
        this.updateScrollbar();

      }.bind(this), 1000)
      
    },
    
    /**
     * Efeito de digitando a mensagem.
     *
     * Cria um efeito de digita o da mensagem, com um avatar e um texto que ser  apagado
     * apos alguns segundos.
     */
    typingEffect() {

      // Criar o novo elemento div (Elemento div)
      let msgE = Object.assign(document.createElement('div'), { className: "message loading new"});
      
      // Criar o elemento figure e img
      let figure = Object.assign(document.createElement('figure'), { className: 'avatar' });
      let img = Object.assign(document.createElement('img'), { src: './assets/img/sani-bot.png' });
      figure.appendChild(img);

      // Criar o span
      let span = document.createElement('span');

      // Adicionar o figure e span ao msgE (Elemento div)
      msgE.appendChild(figure);
      msgE.appendChild(span);

      // Selecionar o container e adicionar o novo elemento msgE (Elemento div)
      document.querySelector('.mCSB_container').appendChild(msgE);

      this.updateScrollbar(); 
      
    },
    
    /**
     * Processa a mensagem enviada pelo usu rio.
     *
     * Verifica se a mensagem  um CPF e se sim, processa o CPF e retorna as dividas
     * do usuário. Se a mensagem for uma opção de pagamento, retorna as opções de
     * pagamento. Se a mensagem for um acordo, retorna as informa informçoes do acordo aberto.
     *
     * @param {string} msg - A mensagem enviada pelo usu rio.
     */
    getProcessarData(msg) {
      let url = 'https://resolvaki.com.br/bot/api/Resolvaki';
      const treatResultProcessData = (result) => {
        if (!isNaN(msg) && msg.trim() !== '' && msg.length === 11) {

          let dividas = result.dividas;

          dividas.forEach(el => this.newMessage(el.descricao, el.idContrato, "contrato", "clickable"));

          this.newMessage("Clique na mensagem da divida que deseja obter mais detalhes.");
            
        } else if (msg.toLowerCase().includes('opções de pagamento')) {
          
          let div = document.createElement('div');
          let ul = document.createElement('ul');
         
          result.opcoespagamento.forEach(opcao => {
            let li = document.createElement('li');
            li.textContent = `${opcao.tipo}: ${opcao.valor}`;
            ul.appendChild(li);
          });

          div.appendChild(ul);

          this.newMessage(div.innerHTML);

        } else if (msg.toLowerCase().includes('acordo')) {

          let div = document.createElement('div');
          let ul = document.createElement('ul');

          let li = document.createElement('li');
          li.textContent = `${result.acordo.resumo}`;
          ul.appendChild(li); 

          li = document.createElement('li');
          li.textContent = `${result.acordo.detalhes}`;
          ul.appendChild(li);

          div.appendChild(ul);

          this.newMessage(div.innerHTML);
        } else {
          this.newMessage("Erro ao processar o CPF. Verifique se o CPF foi digitado corretamente ou a Opção selecionada existe.");
        }
        
      }

      fetch(`${url}/processar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      })
      .then(response => response.json())
      .then(result => treatResultProcessData(result.data))
      .catch(
        error => {
          this.newMessage("Erro ao processar o CPF. Verifique se o CPF foi digitado corretamente ou a Opção selecionada existe.");
          console.error(error)
        });
    },

    /**
     * Recupera os detalhes de uma divida pelo seu numero.
     * 
     * @param {number} msg - Número da divida
     */
    getDetailDebt(msg) {
      let url = 'https://resolvaki.com.br/bot/api/Resolvaki';

      fetch(`${url}/detalhes/${msg}`, {
        method: 'GET',
      })
        .then(response => response.json())
        .then(el => {
          let htmlMsg = `
            <ul>
              <div><strong>Descrição:</strong> ${el.descricao}</div>
              <div><strong>Valor:</strong> ${this.formatCurrency(el.valor)}</div>
              <div><strong>Data de Vencimento:</strong> ${this.formatDate(el.dataVencimento)}</div>
              <div><strong>Status:</strong> ${el.status}</div>
              <div class="clickable option_button" data_type="divida" id="${msg}" >Resumo Simples</div>
            </ul>
        `;
          this.newMessage(`Divida número ${el.idContrato} ?`);
          this.newMessage(htmlMsg, el.idContrato, "divida");
        })
        .catch(
          error => {
            this.newMessage("Divida Indisponível no momento, tente mais tarde.");
            console.error(error)
          });
    },

    getOptionPayment(msg) {
      let url = 'https://resolvaki.com.br/bot/api/Resolvaki';
      fetch(`${url}/opcoes?idContrato=${msg}`, {
        method: 'POST',
      })
        .then(response => response.json())
        .then(el => {
          this.newMessage(`Divida ${msg}: ${el.resumo}`, el.idContrato);
        })
    },

    /**
     * Formata um valor numérico para o formato de moeda brasileira.
     * 
     * @param {number} value - O valor a ser formatado.
     * @returns {string} O valor formatado como moeda brasileira.
     */
    formatCurrency(value) {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    /**
     * Formata uma data para o formato de data brasileira.
     * 
     * @param {string|Date} date - A data a ser formatada.
     * @returns {string} A data formatada como data brasileira.
     */
    formatDate(date) {
      return new Date(date).toLocaleDateString('pt-BR');
    },

    firstMessage() {
      if (this.message.value !== '')
        return;
      
      setTimeout(function () {
        let htmlMsg = `<div class="container">
                        <div class="option">Ou se preferir, clique em uma das opções abaixo:</div>
                        <div class="clickable option_button" data_type="option" id="1" >Opções de pagamento</div>
                        <div class="clickable option_button" data_type="option" id="2" >Acordo Realizados</div>
                      </div>`
        this.newMessage('Ola, seja bem-vindo(a) !');
        this.newMessage('Informe o <strong>CPF</strong> para consultar dívidas.');
        this.newMessage(htmlMsg);
      }.bind(this), 1000);
    },

    /**
     * Atualiza o mCustomScrollbar.
     *
     * Atualiza a barra de rolagem para o final da div, para que as mensagens
     * sejam sempre visíveis.
     */
    updateScrollbar() {
      this.$messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
      });
    },
  }
} 

const chat = new Chat();
chat.start();