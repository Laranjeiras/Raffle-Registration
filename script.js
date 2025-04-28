document.addEventListener('DOMContentLoaded', function() {
    // Função para obter parâmetros da URL
    function obterParametroUrl(nome) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(nome);
    }
    
    // Obter o ID do sorteio da URL
    const sorteioId = obterParametroUrl('id');
    
    if (!sorteioId) {
        exibirMensagem('Erro: ID do sorteio não fornecido na URL.', 'erro');
        document.getElementById('participacao-form').style.display = 'none';
        return;
    }
    
    // Buscar informações do sorteio
    buscarInformacoesSorteio(sorteioId);
    
    // Adicionar máscaras aos campos
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.substring(0, 11);
        
        if (valor.length > 9) {
            valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        } else if (valor.length > 6) {
            valor = valor.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3');
        } else if (valor.length > 3) {
            valor = valor.replace(/^(\d{3})(\d{1,3})$/, '$1.$2');
        }
        
        e.target.value = valor;
    });
    
    const telefoneInput = document.getElementById('telefone');
    telefoneInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.substring(0, 11);
        
        if (valor.length > 10) {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (valor.length > 6) {
            valor = valor.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3');
        } else if (valor.length > 2) {
            valor = valor.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        }
        
        e.target.value = valor;
    });
    
    // Adicionar evento de envio do formulário
    const form = document.getElementById('participacao-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        enviarFormulario(sorteioId);
    });
});

// Função para buscar informações do sorteio
function buscarInformacoesSorteio(sorteioId) {
    const sorteioInfo = document.getElementById('sorteio-info');
    
    let data = {
        id: "EDEC5EAB-C6DA-4CBE-A75E-DCC8643C5635",
        descricao: "TESTE SORTERIO"        
    }
    sorteioInfo.innerHTML = `
    <h2>${data.id || 'Sorteio'}</h2>
    <p>${data.descricao || 'Participe do nosso sorteio preenchendo o formulário abaixo.'}</p>
    <p><strong>Data do sorteio:</strong> ${formatarData(data.dataSorteio) || 'A definir'}</p>
    `;    

    return;
    // URL da API para buscar informações do sorteio
    const apiUrl = `https://sua-api.com/sorteios/${sorteioId}`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar informações do sorteio');
            }
            return response.json();
        })
        .then(data => {
            // Exibir informações do sorteio
            sorteioInfo.innerHTML = `
                <h2>${data.titulo || 'Sorteio'}</h2>
                <p>${data.descricao || 'Participe do nosso sorteio preenchendo o formulário abaixo.'}</p>
                <p><strong>Data do sorteio:</strong> ${formatarData(data.dataSorteio) || 'A definir'}</p>
            `;
        })
        .catch(error => {
            console.error('Erro:', error);
            sorteioInfo.innerHTML = `
                <p class="erro">Não foi possível carregar as informações do sorteio. Por favor, tente novamente mais tarde.</p>
            `;
        });
}

// Função para enviar o formulário
function enviarFormulario(sorteioId) {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const cpf = document.getElementById('cpf').value;
    const telefone = document.getElementById('telefone').value;
    const quantidade = document.getElementById('quantidade').value;
    
    // Validar campos
    if (!nome || !email || !cpf || !telefone || !quantidade) {
        exibirMensagem('Por favor, preencha todos os campos.', 'erro');
        return;
    }
    
    // Criar objeto com os dados do formulário
    const dados = {
        Id: gerarUUID(), // Gera um UUID para o registro
        QuantidadeCotas: parseInt(quantidade),
        SorteioId: sorteioId,
        Nome: nome,
        Cpf: cpf,
        Email: email,
        telefone: telefone
    };
    
    // URL da API para enviar os dados
    const apiUrl = 'https://d2f4t3v9bi.execute-api.sa-east-1.amazonaws.com/prod/registration';
    
    // Configuração da requisição
    const opcoes = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    };
    
    // Enviar dados para a API
    fetch(apiUrl, opcoes)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar participação');
            }
            return response.json();
        })
        .then(data => {
            exibirMensagem('Participação registrada com sucesso! Boa sorte!', 'sucesso');
            document.getElementById('participacao-form').reset();
        })
        .catch(error => {
            console.error('Erro:', error);
            exibirMensagem('Erro ao registrar participação. Por favor, tente novamente.', 'erro');
        });
}

// Função para exibir mensagens
function exibirMensagem(texto, tipo) {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.textContent = texto;
    mensagemDiv.className = 'mensagem ' + tipo;
    
    // Rolar até a mensagem
    mensagemDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Limpar a mensagem após 5 segundos se for de sucesso
    if (tipo === 'sucesso') {
        setTimeout(() => {
            mensagemDiv.textContent = '';
            mensagemDiv.className = 'mensagem';
        }, 5000);
    }
}

// Função para formatar data
function formatarData(dataString) {
    if (!dataString) return null;
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função para gerar UUID
function gerarUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
} 