/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

// Número do proprietário (55 + DDD + número, só dígitos)
var NUMERO_DONO = '5598985008066';

var totalCompra = 0;
var temporizador;


/* =========================================================
   CARRINHO
   ========================================================= */

function adicionarAoCarrinho(nome, tamanho, preco) {
    var listaCarrinho = document.getElementById('itens-carrinho');
    var totalEl = document.getElementById('total');

    // Se o carrinho estiver com a mensagem inicial "vazio", limpa-a
    if (listaCarrinho.children.length === 1 &&
        listaCarrinho.children[0].textContent.includes('vazio')) {
        listaCarrinho.innerHTML = '';
    }

    // Cria o item da lista
    var item = document.createElement('li');
    item.textContent = nome + ' (' + tamanho + ') - R$ ' + preco.toFixed(2).replace('.', ',');
    listaCarrinho.appendChild(item);

    // Soma o total
    totalCompra += Number(preco);
    totalEl.textContent = totalCompra.toFixed(2).replace('.', ',');
}

function carrinhoVazio() {
    var itens = document.querySelectorAll('#itens-carrinho li');
    return itens.length === 0 || itens[0].textContent.indexOf('vazio') !== -1;
}


/* =========================================================
   CARROSSEL (setas)
   ========================================================= */

function rolarCarrossel(id, direcao) {
    var lista = document.getElementById(id);
    var card = lista.firstElementChild;
    var gap = parseFloat(getComputedStyle(lista).columnGap) || 0;
    lista.scrollBy({ left: direcao * (card.offsetWidth + gap), behavior: 'smooth' });
}


/* =========================================================
   PAGAMENTO
   ========================================================= */

// Mostra o campo de troco só quando a forma de pagamento for dinheiro
document.querySelectorAll('input[name="pagamento"]').forEach(function (r) {
    r.addEventListener('change', function () {
        document.getElementById('troco-box').style.display =
            (r.value === 'Dinheiro' && r.checked) ? 'block' : 'none';
    });
});

// Abre a seção de dados e pagamento
function irParaPagamento() {
    var aviso = document.getElementById('msg-carrinho');

    if (carrinhoVazio()) {
        aviso.textContent = 'Adicione pelo menos um item ao carrinho.';
        return;
    }

    aviso.textContent = '';
    var secao = document.getElementById('finalizar');
    secao.style.display = 'block';
    secao.scrollIntoView({ behavior: 'smooth' });
}


/* =========================================================
   ENVIO PARA O WHATSAPP DO PROPRIETÁRIO
   ========================================================= */

function enviarPedidoWhatsApp(d) {
    var linhas = [];
    document.querySelectorAll('#itens-carrinho li').forEach(function (li) {
        linhas.push('• ' + li.textContent);
    });

    var msg =
        '*NOVO PEDIDO* 🍕\n\n' +
        '*Itens:*\n' + linhas.join('\n') + '\n\n' +
        '*Total:* R$ ' + d.total + '\n' +
        '*Pagamento:* ' + d.forma + (d.troco ? ' (troco para R$ ' + d.troco + ')' : '') + '\n\n' +
        '*Cliente:* ' + d.nome + '\n' +
        '*Celular:* ' + d.celular + '\n' +
        '*Endereço:* ' + d.rua + ', ' + d.numero + ' - ' + d.bairro +
        (d.complemento ? '\n*Complemento:* ' + d.complemento : '');

    var url = 'https://wa.me/' + NUMERO_DONO + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
}


/* =========================================================
   FINALIZAR PEDIDO
   ========================================================= */

function finalizarPedido() {
    var msg = document.getElementById('msg-pedido');

    function erro(texto) {
        msg.className = 'erro';
        msg.textContent = texto;
    }

    // Lê os campos
    var nome = document.getElementById('cli-nome').value.trim();
    var celularBruto = document.getElementById('cli-celular').value;
    var celular = celularBruto.replace(/\D/g, '');
    var rua = document.getElementById('cli-rua').value.trim();
    var numero = document.getElementById('cli-numero').value.trim();
    var bairro = document.getElementById('cli-bairro').value.trim();
    var complemento = document.getElementById('cli-complemento').value.trim();
    var escolhida = document.querySelector('input[name="pagamento"]:checked');

    // Valida
    if (carrinhoVazio()) return erro('Adicione pelo menos um item ao carrinho.');
    if (nome.length < 3) return erro('Informe seu nome completo.');
    if (celular.length < 10 || celular.length > 11) return erro('Informe um celular válido com DDD.');
    if (!rua || !numero || !bairro) return erro('Preencha rua, número e bairro.');
    if (!escolhida) return erro('Escolha uma forma de pagamento.');

    var total = document.getElementById('total').textContent;
    var forma = escolhida.value;
    var troco = forma === 'Dinheiro' ? document.getElementById('troco').value : '';

    // Envia o pedido para o WhatsApp do proprietário
    enviarPedidoWhatsApp({
        total: total,
        forma: forma,
        troco: troco,
        nome: nome,
        celular: celularBruto,
        rua: rua,
        numero: numero,
        bairro: bairro,
        complemento: complemento
    });

    // Mensagem da tela de compra finalizada
    var texto = 'Pedido enviado, ' + nome + '! Aguarde a confirmação do restaurante.' +
                ' Pagamento: ' + forma + (forma === 'Dinheiro' ? ' na entrega' : '') +
                (troco ? ' (troco para R$ ' + troco + ')' : '') + '.' +
                ' Total: R$ ' + total +
                '. Entrega em: ' + rua + ', ' + numero + ' - ' + bairro + '.';

    msg.textContent = '';
    mostrarCompraFinalizada(texto);
}


/* =========================================================
   TELA DE COMPRA FINALIZADA
   ========================================================= */

function mostrarCompraFinalizada(texto) {
    document.getElementById('texto-final').textContent = texto;
    document.getElementById('compra-finalizada').style.display = 'flex';

    var segundos = 10;
    document.getElementById('contagem').textContent = segundos;

    temporizador = setInterval(function () {
        segundos--;
        document.getElementById('contagem').textContent = segundos;
        if (segundos <= 0) voltarAoInicio();
    }, 1000);
}

function voltarAoInicio() {
    clearInterval(temporizador);
    window.scrollTo(0, 0);
    location.reload(); // atualiza a página e volta ao início
}