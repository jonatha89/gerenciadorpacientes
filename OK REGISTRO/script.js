let pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];
let pacienteSelecionado = null;
let atividadeSelecionada = null;
let frequenciaPaciente = [];

const tabelaPacientes = document.querySelector('#tabelaPacientes tbody');
const tabelaAtividades = document.querySelector('#tabelaAtividades tbody');
const tabelaRegistros = document.querySelector('#tabelaRegistros tbody');
const tabelaFrequencia = document.querySelector('#tabelaFrequencia tbody');
const nomePacienteElement = document.getElementById('nomePaciente');
const nomeAtividadeElement = document.getElementById('nomeAtividade');
const nomePacienteFrequenciaElement = document.getElementById('nomePacienteFrequencia');
const atividadesDiv = document.getElementById('atividades');
const registrosDiv = document.getElementById('registros');
const frequenciaDiv = document.getElementById('frequencia');
const totalPresencaElement = document.getElementById('totalPresenca');
const totalHorasDiaElement = document.getElementById('totalHorasDia');
const totalFaturamentoElement = document.getElementById('totalFaturamento');

// Funções de atualização das listas
function atualizarListaPacientes() {
    tabelaPacientes.innerHTML = '';
    pacientes.forEach((paciente, index) => {
        const row = tabelaPacientes.insertRow();
        row.innerHTML = `
            <td>${paciente.nome}</td>
            <td>${paciente.tipoAtendimento}</td>
            <td>${paciente.unidade}</td>
            <td>${paciente.valorHora || ''}</td>
            <td>${paciente.horasDia || ''}</td>
            <td>
                <button onclick="editarPaciente(${index})" aria-label="Editar paciente"><i class="fas fa-edit"></i></button>
                <button onclick="deletarPaciente(${index})" aria-label="Deletar paciente"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        row.addEventListener('click', () => selecionarPaciente(index));
    });
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
}

function atualizarListaAtividades() {
    tabelaAtividades.innerHTML = '';
    if (pacienteSelecionado) {
        pacienteSelecionado.atividades.forEach((atividade, index) => {
            const row = tabelaAtividades.insertRow();
            row.innerHTML = `
                <td>${atividade.nome}</td>
                <td>
                    <button onclick="selecionarAtividade(${index})" aria-label="Selecionar atividade">Selecionar</button>
                    <button onclick="editarAtividade(${index})" aria-label="Editar atividade"><i class="fas fa-edit"></i></button>
                    <button onclick="deletarAtividade(${index})" aria-label="Deletar atividade"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
        });
    }
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
}

function atualizarListaRegistros() {
    tabelaRegistros.innerHTML = '';
    if (atividadeSelecionada) {
        atividadeSelecionada.registros.forEach((registro, index) => {
            const row = tabelaRegistros.insertRow();
            const dataInicioFormatada = new Date(registro.dataInicio).toLocaleString();
            const dataFimFormatada = registro.dataFim ? new Date(registro.dataFim).toLocaleString() : '';
            row.innerHTML = `
                <td>${registro.nomeEstimulo}</td>
                <td>${dataInicioFormatada}</td>
                <td>${dataFimFormatada}</td>
                <td>
                    <button onclick="finalizarRegistro(event, ${index})" aria-label="Finalizar registro">Finalizar</button>
                    <button onclick="editarRegistro(${index})" aria-label="Editar registro"><i class="fas fa-edit"></i></button>
                    <button onclick="deletarRegistro(${index})" aria-label="Deletar registro"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
        });
    }
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
}

function atualizarTabelaFrequencia() {
    tabelaFrequencia.innerHTML = '';
    let totalPresenca = 0;
    let totalHorasDia = 0;
    let totalFaturamento = 0;
    frequenciaPaciente.forEach((frequencia, index) => {
        const row = tabelaFrequencia.insertRow();
        row.innerHTML = `
            <td>${frequencia.diaAtendimento}</td>
            <td>${frequencia.presenca}</td>
            <td>${frequencia.horasDia}</td>
            <td>${frequencia.valorHora}</td>
            <td>${frequencia.total}</td>
            <td><button onclick="excluirRegistroFrequencia(${index})"><i class="fas fa-trash-alt"></i></button></td>
        `;
        if (frequencia.presenca.includes('check')) totalPresenca++;
        totalHorasDia += frequencia.horasDia;
        totalFaturamento += frequencia.total;
    });
    totalPresencaElement.textContent = totalPresenca;
    totalHorasDiaElement.textContent = totalHorasDia;
    totalFaturamentoElement.textContent = totalFaturamento;
}

// Funções de seleção
function selecionarPaciente(index) {
    pacienteSelecionado = pacientes[index];
    nomePacienteElement.textContent = pacienteSelecionado.nome;
    nomePacienteFrequenciaElement.textContent = pacienteSelecionado.nome;
    atividadesDiv.style.display = 'block';
    registrosDiv.style.display = 'none';
    frequenciaDiv.style.display = 'block';
    atualizarListaAtividades();
    atualizarTabelaFrequencia();
}

function selecionarAtividade(index) {
    atividadeSelecionada = pacienteSelecionado.atividades[index];
    nomeAtividadeElement.textContent = atividadeSelecionada.nome;
    registrosDiv.style.display = 'block';
    atualizarListaRegistros();
}

// Funções CRUD
document.getElementById('adicionarPaciente').addEventListener('click', () => {
    const nome = prompt('Nome do paciente:');
    const tipoAtendimento = prompt('Tipo de atendimento (máximo 20 caracteres):');
    const unidade = prompt('Unidade (máximo 20 caracteres):');
    const valorHora = parseInt(prompt('Valor da hora (inteiro):'));
    const horasDia = parseInt(prompt('Horas/dia (inteiro):'));

    if (nome && tipoAtendimento && unidade && !isNaN(valorHora) && !isNaN(horasDia)) {
        const paciente = {
            nome,
            tipoAtendimento: tipoAtendimento.substring(0, 20),
            unidade: unidade.substring(0, 20),
            valorHora,
            horasDia,
            atividades: [],
        };
        pacientes.push(paciente);
        atualizarListaPacientes();
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
});

function editarPaciente(index) {
    const novoNome = prompt('Novo nome do paciente:', pacientes[index].nome);
    const novoTipoAtendimento = prompt('Novo tipo de atendimento (máximo 20 caracteres):', pacientes[index].tipoAtendimento);
    const novaUnidade = prompt('Nova unidade (máximo 20 caracteres):', pacientes[index].unidade);
    const novoValorHora = parseInt(prompt('Novo valor da hora (inteiro):', pacientes[index].valorHora));
    const novasHorasDia = parseInt(prompt('Novas horas/dia (inteiro):', pacientes[index].horasDia));

    if (novoNome && novoTipoAtendimento && novaUnidade && !isNaN(novoValorHora) && !isNaN(novasHorasDia)) {
        pacientes[index].nome = novoNome;
        pacientes[index].tipoAtendimento = novoTipoAtendimento.substring(0, 20);
        pacientes[index].unidade = novaUnidade.substring(0, 20);
        pacientes[index].valorHora = novoValorHora;
        pacientes[index].horasDia = novasHorasDia;
        atualizarListaPacientes();
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
}

function deletarPaciente(index) {
    if (confirm(`Deletar ${pacientes[index].nome}?`)) {
        pacientes.splice(index, 1);
        pacienteSelecionado = null;
        atividadesDiv.style.display = 'none';
        registrosDiv.style.display = 'none';
        frequenciaDiv.style.display = 'none';
        atualizarListaPacientes();
    }
}

document.getElementById('adicionarAtividade').addEventListener('click', () => {
    const nome = prompt('Nome da atividade:');
    if (nome) {
        const atividade = { nome, registros: [] };
        pacienteSelecionado.atividades.push(atividade);
        atualizarListaAtividades();
    } else {
        alert('Por favor, preencha o campo nome.');
    }
});

function editarAtividade(index) {
    const novoNome = prompt('Novo nome da atividade:', pacienteSelecionado.atividades[index].nome);
    if (novoNome) {
        pacienteSelecionado.atividades[index].nome = novoNome;
        atualizarListaAtividades();
    } else {
        alert('Por favor, preencha o campo nome.');
    }
}

function deletarAtividade(index) {
    if (confirm(`Deletar ${pacienteSelecionado.atividades[index].nome}?`)) {
        pacienteSelecionado.atividades.splice(index, 1);
        atividadeSelecionada = null;
        registrosDiv.style.display = 'none';
        atualizarListaAtividades();
    }
}

document.getElementById('adicionarRegistro').addEventListener('click', () => {
    const nomeEstimulo = prompt('Nome do estímulo:');
    if (nomeEstimulo) {
        const dataInicio = new Date().toISOString();
        const registro = { nomeEstimulo, dataInicio, dataFim: null };
        atividadeSelecionada.registros.push(registro);
        atualizarListaRegistros();
    } else {
        alert('Por favor, preencha o campo nome do estímulo.');
    }
});

function editarRegistro(index) {
    const novoNomeEstimulo = prompt('Novo nome do estímulo:', atividadeSelecionada.registros[index].nomeEstimulo);
    if (novoNomeEstimulo) {
        atividadeSelecionada.registros[index].nomeEstimulo = novoNomeEstimulo;
        atualizarListaRegistros();
    } else {
        alert('Por favor, preencha o campo nome do estímulo.');
    }
}

function deletarRegistro(index) {
    if (confirm(`Deletar registro ${atividadeSelecionada.registros[index].nomeEstimulo}?`)) {
        atividadeSelecionada.registros.splice(index, 1);
        atualizarListaRegistros();
    }
}

function finalizarRegistro(event, index) {
    const registro = atividadeSelecionada.registros[index];
    registro.dataFim = new Date().toISOString();
    atualizarListaRegistros();
}

document.getElementById('imprimirRegistros').addEventListener('click', () => {
    const tabela = document.getElementById('tabelaRegistros');
    const conteudo = tabela.outerHTML;
    const janelaImpressao = window.open('', '', 'height=500,width=800');
    janelaImpressao.document.write('<html><head><title>Registros de Estímulos</title></head><body>');
    janelaImpressao.document.write(conteudo);
    janelaImpressao.document.write('</body></html>');
    janelaImpressao.document.close();
    janelaImpressao.print();
    janelaImpressao.close();
});

document.getElementById('registrarPresenca').addEventListener('click', () => {
    if (pacienteSelecionado) {
        const dataAtual = new Date().toLocaleDateString();
        const frequencia = {
            diaAtendimento: dataAtual,
            presenca: '<i class="fas fa-check-circle" style="color: green;"></i>',
            horasDia: pacienteSelecionado.horasDia,
            valorHora: pacienteSelecionado.valorHora,
            total: pacienteSelecionado.horasDia * pacienteSelecionado.valorHora,
        };
        frequenciaPaciente.push(frequencia);
        atualizarTabelaFrequencia();
    }
});

document.getElementById('registrarAusencia').addEventListener('click', () => {
    if (pacienteSelecionado) {
        const dataAtual = new Date().toLocaleDateString();
        const frequencia = {
            diaAtendimento: dataAtual,
            presenca: '<i class="fas fa-times-circle" style="color: red;"></i>',
            horasDia: 0,
            valorHora: 0,
            total: 0,
        };
        frequenciaPaciente.push(frequencia);
        atualizarTabelaFrequencia();
    }
});

function excluirRegistroFrequencia(index) {
    if (confirm('Deseja excluir este registro de frequência?')) {
        frequenciaPaciente.splice(index, 1);
        atualizarTabelaFrequencia();
    }
}

// Inicialização
atualizarListaPacientes();