document.addEventListener('DOMContentLoaded', function() {
    // ========== ELEMENTOS DO DOM ========== //
    const themeSwitch = document.getElementById('themeSwitch');
    const btnAdicionar = document.getElementById('btnAdicionar');
    const btnListar = document.getElementById('btnListar');
    const btnEditar = document.getElementById('btnEditar');
    const btnConcluir = document.getElementById('btnConcluir');
    const btnExcluir = document.getElementById('btnExcluir');
    const btnSair = document.getElementById('btnSair');
    
    const formAdicionar = document.getElementById('formAdicionar');
    const formEditar = document.getElementById('formEditar');
    const formID = document.getElementById('formID');
    
    const titulo = document.getElementById('titulo');
    const descricao = document.getElementById('descricao');
    const novoTitulo = document.getElementById('novoTitulo');
    const novaDescricao = document.getElementById('novaDescricao');
    const idTarefa = document.getElementById('idTarefa');
    const tituloFormID = document.getElementById('tituloFormID');
    
    const btnConfirmarAdicionar = document.getElementById('btnConfirmarAdicionar');
    const btnCancelarAdicionar = document.getElementById('btnCancelarAdicionar');
    const btnConfirmarEditar = document.getElementById('btnConfirmarEditar');
    const btnCancelarEditar = document.getElementById('btnCancelarEditar');
    const btnConfirmarID = document.getElementById('btnConfirmarID');
    const btnCancelarID = document.getElementById('btnCancelarID');
    
    const listaTarefas = document.getElementById('tarefas');
    const mensagem = document.getElementById('mensagem');
    const totalTarefas = document.getElementById('totalTarefas');
    const concluidasTarefas = document.getElementById('concluidasTarefas');
    const pendentesTarefas = document.getElementById('pendentesTarefas');

    // ========== ESTADO DO APP ========== //
    let listaDeTarefas = JSON.parse(localStorage.getItem('nebulaTasks')) || [];
    let tarefaParaEditar = null;
    let currentTheme = localStorage.getItem('theme') || 'light';

    // ========== INICIALIZAÇÃO ========== //
    function init() {
        applyTheme(currentTheme);
        themeSwitch.checked = currentTheme === 'dark';
        updateStats();
        listarTarefas();
        
        // Event Listeners
        themeSwitch.addEventListener('change', toggleTheme);
        
        btnAdicionar.addEventListener('click', mostrarFormAdicionar);
        btnListar.addEventListener('click', listarTarefas);
        btnEditar.addEventListener('click', () => mostrarFormID('editar'));
        btnConcluir.addEventListener('click', () => mostrarFormID('concluir'));
        btnExcluir.addEventListener('click', () => mostrarFormID('excluir'));
        btnSair.addEventListener('click', sair);
        
        btnConfirmarAdicionar.addEventListener('click', adicionarTarefa);
        btnCancelarAdicionar.addEventListener('click', esconderForms);
        
        btnConfirmarEditar.addEventListener('click', editarTarefa);
        btnCancelarEditar.addEventListener('click', esconderForms);
        
        btnConfirmarID.addEventListener('click', processarID);
        btnCancelarID.addEventListener('click', esconderForms);
    }

    // ========== GERENCIAMENTO DE TEMA ========== //
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // ========== GERENCIAMENTO DE FORMULÁRIOS ========== //
    function mostrarFormAdicionar() {
        esconderForms();
        formAdicionar.style.display = 'block';
        titulo.focus();
    }

    function mostrarFormID(acao) {
        esconderForms();
        formID.style.display = 'block';
        
        switch(acao) {
            case 'editar':
                tituloFormID.innerHTML = '<i class="fas fa-edit"></i> Editar Tarefa';
                break;
            case 'concluir':
                tituloFormID.innerHTML = '<i class="fas fa-check"></i> Concluir Tarefa';
                break;
            case 'excluir':
                tituloFormID.innerHTML = '<i class="fas fa-trash"></i> Excluir Tarefa';
                break;
        }
        
        idTarefa.setAttribute('data-acao', acao);
        idTarefa.focus();
    }

    function esconderForms() {
        formAdicionar.style.display = 'none';
        formEditar.style.display = 'none';
        formID.style.display = 'none';
        
        titulo.value = '';
        descricao.value = '';
        novoTitulo.value = '';
        novaDescricao.value = '';
        idTarefa.value = '';
        tarefaParaEditar = null;
    }

    // ========== GERENCIAMENTO DE TAREFAS ========== //
    function adicionarTarefa() {
        const tituloValue = titulo.value.trim();
        const descricaoValue = descricao.value.trim();
        
        if (!tituloValue) {
            mostrarMensagem('Por favor, informe o título da tarefa.', 'erro');
            titulo.focus();
            return;
        }
        
        const novaTarefa = {
            id: listaDeTarefas.length > 0 ? Math.max(...listaDeTarefas.map(t => t.id)) + 1 : 1,
            titulo: tituloValue,
            descricao: descricaoValue,
            status: 'pendente',
            dataCriacao: new Date().toISOString(),
            dataConclusao: null
        };
        
        listaDeTarefas.push(novaTarefa);
        salvarTarefas();
        esconderForms();
        mostrarMensagem('Tarefa adicionada com sucesso! ✨', 'sucesso');
        listarTarefas();
        
        // Efeito de confete
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    function listarTarefas() {
        esconderForms();
        updateStats();
        
        if (listaDeTarefas.length === 0) {
            listaTarefas.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>Nenhuma tarefa cadastrada</h3>
                    <p>Comece adicionando sua primeira tarefa!</p>
                </div>
            `;
            return;
        }
        
        // Ordenar tarefas: concluídas por último
        const tarefasOrdenadas = [...listaDeTarefas].sort((a, b) => {
            if (a.status === 'concluída' && b.status !== 'concluída') return 1;
            if (a.status !== 'concluída' && b.status === 'concluída') return -1;
            return new Date(b.dataCriacao) - new Date(a.dataCriacao);
        });
        
        listaTarefas.innerHTML = '';
        
        tarefasOrdenadas.forEach(tarefa => {
            const divTarefa = document.createElement('div');
            divTarefa.className = `tarefa ${tarefa.status === 'concluída' ? 'concluida' : ''}`;
            divTarefa.dataset.id = tarefa.id;
            
            const dataCriacao = new Date(tarefa.dataCriacao);
            const dataFormatada = dataCriacao.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            divTarefa.innerHTML = `
                <span class="tarefa-id">#${tarefa.id}</span>
                <h3>${tarefa.titulo}</h3>
                ${tarefa.descricao ? `<p>${tarefa.descricao}</p>` : ''}
                <span class="tarefa-status ${tarefa.status === 'pendente' ? 'pendente' : 'concluida'}">
                    ${tarefa.status === 'pendente' ? 'Pendente' : 'Concluída'}
                </span>
                <span class="tarefa-data">Criada em: ${dataFormatada}</span>
            `;
            
            // Efeito de entrada
            setTimeout(() => {
                divTarefa.style.opacity = '1';
                divTarefa.style.transform = 'translateY(0)';
            }, 100 * listaDeTarefas.indexOf(tarefa));
            
            listaTarefas.appendChild(divTarefa);
        });
    }

    function processarID() {
        const id = parseInt(idTarefa.value);
        const acao = idTarefa.getAttribute('data-acao');
        
        if (isNaN(id) || id <= 0) {
            mostrarMensagem('Por favor, informe um ID válido.', 'erro');
            return;
        }
        
        const tarefa = listaDeTarefas.find(t => t.id === id);
        
        if (!tarefa) {
            mostrarMensagem('Tarefa não encontrada.', 'erro');
            return;
        }
        
        switch(acao) {
            case 'editar':
                tarefaParaEditar = tarefa;
                novoTitulo.value = tarefa.titulo;
                novaDescricao.value = tarefa.descricao || '';
                formID.style.display = 'none';
                formEditar.style.display = 'block';
                novoTitulo.focus();
                break;
            case 'concluir':
                tarefa.status = 'concluída';
                tarefa.dataConclusao = new Date().toISOString();
                salvarTarefas();
                esconderForms();
                mostrarMensagem('Tarefa marcada como concluída! 🎉', 'sucesso');
                listarTarefas();
                confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
                break;
                case 'excluir':
                    if (confirm(`Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`)) {
                        // Filtra a lista removendo a tarefa com o ID especificado
                        listaDeTarefas = listaDeTarefas.filter(t => t.id !== id);
                        
                        // Atualiza o localStorage
                        localStorage.setItem('nebulaTasks', JSON.stringify(listaDeTarefas));
                        
                        // Atualiza as estatísticas
                        updateStats();
                        
                        // Esconde os formulários
                        esconderForms();
                        
                        // Mostra mensagem de sucesso
                        mostrarMensagem('Tarefa excluída com sucesso!', 'sucesso');
                        
                        // Recarrega a lista de tarefas
                        listarTarefas();
                        
                        // Debug: verifica no console se a tarefa foi removida
                        console.log('Tarefas após exclusão:', listaDeTarefas);
                    }
                    break;
        }
    }

    function editarTarefa() {
        const novoTituloValue = novoTitulo.value.trim();
        
        if (!novoTituloValue) {
            mostrarMensagem('Por favor, informe o título da tarefa.', 'erro');
            novoTitulo.focus();
            return;
        }
        
        tarefaParaEditar.titulo = novoTituloValue;
        tarefaParaEditar.descricao = novaDescricao.value.trim();
        salvarTarefas();
        esconderForms();
        mostrarMensagem('Tarefa editada com sucesso!', 'sucesso');
        listarTarefas();
    }

    // ========== PERSISTÊNCIA & ESTATÍSTICAS ========== //
    function salvarTarefas() {
        localStorage.setItem('nebulaTasks', JSON.stringify(listaDeTarefas));
        updateStats();
    }

    function updateStats() {
        totalTarefas.textContent = listaDeTarefas.length;
        concluidasTarefas.textContent = listaDeTarefas.filter(t => t.status === 'concluída').length;
        pendentesTarefas.textContent = listaDeTarefas.filter(t => t.status === 'pendente').length;
    }

    // ========== FEEDBACK & ANIMAÇÕES ========== //
    function mostrarMensagem(texto, tipo) {
        mensagem.textContent = texto;
        mensagem.className = `mensagem ${tipo}`;
        mensagem.style.opacity = '1';
        mensagem.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            mensagem.style.opacity = '0';
            mensagem.style.transform = 'translateY(20px)';
        }, 3000);
    }

    function sair() {
        if (confirm('Deseja realmente sair do sistema?')) {
            mostrarMensagem('Até logo! 👋', 'sucesso');
            setTimeout(() => {
                window.close(); // Fecha a janela (funciona se o app foi aberto como popup)
            }, 1000);
        }
    }

    // ========== INICIAR APLICAÇÃO ========== //
    init();
});