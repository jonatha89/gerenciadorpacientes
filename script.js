const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

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

let pacienteSelecionado = null;
let atividadeSelecionada = null;
let frequenciaPaciente = [];

// Funções de atualização das listas
function atualizarListaPacientes() {
    tabelaPacientes.innerHTML = '';
    db.collection('pacientes').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const paciente = doc.data();
            const row = tabelaPacientes.insertRow();
            row.innerHTML = `
                <td>${paciente.nome}</td>
                <td>${paciente.tipoAtendimento}</td>
                <td>${paciente.unidade}</td>
                <td>${formatarValorMonetario(paciente.valorHora)}</td>
                <td>${paciente.horasDia}</td>
                <td>
                    <button class="editar" onclick="editarPaciente('${doc.id}')" aria-label="Editar paciente"><i class="fas fa-edit"></i></button>
                    <button class="deletar" onclick="deletarPaciente('${doc.id}')" aria-label="Deletar paciente"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            row.addEventListener('click', () => selecionarPaciente(doc.id, paciente));
        });
    });
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
                    <button class="editar" onclick="editarAtividade(${index})" aria-label="Editar atividade"><i class="fas fa-edit"></i></button>
                    <button class="deletar" onclick="deletarAtividade(${index})" aria-label="Deletar atividade"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
        });
    }
}

function atualizarListaRegistros() {
    tabelaRegistros.innerHTML = '';
    if (atividadeSelecionada) {
        atividadeSelecionada.registros.forEach((registro, index) => {
            const row = tabelaRegistros.insertRow();
            const dataInicioFormatada = new Date(registro.dataInicio).toLocaleString('pt-BR');
            const dataFimFormatada = registro.dataFim ? new Date(registro.dataFim).toLocaleString('pt-BR') : '';
            row.innerHTML = `
                <td>${registro.nomeEstimulo}</td>
                <td>${dataInicioFormatada}</td>
                <td>${dataFimFormatada}</td>
                <td>
                    <button onclick="finalizarRegistro(event, ${index})" aria-label="Finalizar registro">Finalizar</button>
                    <button class="editar" onclick="editarRegistro(${index})" aria-label="Editar registro"><i class="fas fa-edit"></i></button>
                    <button class="deletar" onclick="deletarRegistro(${index})" aria-label="Deletar registro"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
        });
    }
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
            <td>${formatarValorMonetario(frequencia.valorHora)}</td>
            <td>${formatarValorMonetario(frequencia.total)}</td>
            <td><button class="deletar" onclick="excluirRegistroFrequencia(${index})"><i class="fas fa-trash-alt"></i></button></td>
        `;
        if (frequencia.presenca.includes('check')) totalPresenca++;
        totalHorasDia += frequencia.horasDia;
        totalFaturamento += frequencia.total;
    });
    totalPresencaElement.textContent = totalPresenca;
    totalHorasDiaElement.textContent = totalHorasDia;
    totalFaturamentoElement.textContent = formatarValorMonetario(totalFaturamento);
}

// Funções de seleção
function selecionarPaciente(id, paciente) {
    pacienteSelecionado = paciente;
    pacienteSelecionado.id = id; // Adiciona o ID do documento ao objeto paciente
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
        db.collection('pacientes').add(paciente).then(() => {
            atualizarListaPacientes();
        });
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
});

function editarPaciente(id) {
    const novoNome = prompt('Novo nome do paciente:', pacienteSelecionado.nome);
    const novoTipoAtendimento = prompt('Novo tipo de atendimento (máximo 20 caracteres):', pacienteSelecionado.tipoAtendimento);
    const novaUnidade = prompt('Nova unidade (máximo 20 caracteres):', pacienteSelecionado.unidade);
    const novoValorHora = parseInt(prompt('Novo valor da hora (inteiro):', pacienteSelecionado.valorHora));
    const novasHorasDia = parseInt(prompt('Novas horas/dia (inteiro):', pacienteSelecionado.horasDia));

    if (novoNome && novoTipoAtendimento && novaUnidade && !isNaN(novoValorHora) && !isNaN(novasHorasDia)) {
        db.collection('pacientes').doc(id).update({
            nome: novoNome,
            tipoAtendimento: novoTipoAtendimento.substring(0, 20),
            unidade: novaUnidade.substring(0, 20),
            valorHora: novoValorHora,
            horasDia: novasHorasDia,
        }).then(() => {
            atualizarListaPacientes();
        });
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
}

function deletarPaciente(id) {
    if (confirm(`Deletar ${pacienteSelecionado.nome}?`)) {
        db.collection('pacientes').doc(id).delete().then(() => {
            pacienteSelecionado = null;
            atividadesDiv.style.display = 'none';
            registrosDiv.style.display = 'none';
            frequenciaDiv.style.display = 'none';
            atualizarListaPacientes();
        });
    }
}

document.getElementById('adicionarAtividade').addEventListener('click', () => {
    const nome = prompt('Nome da atividade:');
    if (nome) {
        const atividade = { nome, registros: [] };
        pacienteSelecionado.atividades.push(atividade);
        db.collection('pacientes').doc(pacienteSelecionado.id).update({ atividades: pacienteSelecionado.atividades }).then(() => {
            atualizarListaAtividades();
        });
    } else {
        alert('Por favor, preencha o campo nome.');
    }
});

function editarAtividade(index) {
    const novoNome = prompt('Novo nome da atividade:', pacienteSelecionado.atividades[index].nome);
    if (novoNome) {
        pacienteSelecionado.atividades[index].nome = novoNome;
        db.collection('pacientes').doc(pacienteSelecionado.id).update({ atividades: pacienteSelecionado.atividades }).then(() => {
            atualizarListaAtividades();
        });
    } else {
        alert('Por favor, preencha o campo nome.');
    }
}

function deletarAtividade(index) {
    if (confirm(`Deletar ${pacienteSelecionado.atividades[index].nome}?`)) {
        pacienteSelecionado.atividades.splice(index, 1);
        db.collection('pacientes').doc(pacienteSelecionado.id).update({ atividades: pacienteSelecionado.atividades }).then(() => {
            atividadeSelecionada = null;
            registrosDiv.style.display = 'none';
            atualizarListaAtividades();
        });
    }
}

document.getElementById('adicionarRegistro').addEventListener('click', () => {
    const nomeEstimulo = prompt('Nome do estímulo:');
    if (nomeEstimulo) {
        const dataInicio = new Date().toISOString();
        const registro = { nomeEstimulo, dataInicio, dataFim: null };
        atividadeSelecionada.registros.push(registro);
        db.collection('pacientes').doc(pacienteSelecionado.id).update({ atividades: pacienteSelecionado.atividades }).then(() => {
            atualizarListaRegistros();
        });
    } else {
        alert('Por favor, preencha o campo nome do estímulo.');
    }
});

function editarRegistro(index) {
    const novoNomeEstimulo = prompt('Novo nome do estímulo:', atividadeSelecionada.registros[index].nomeEstimulo);
    if (novoNomeEstimulo) {
        atividadeSelecionada.registros[index].nomeEstimulo = novoNomeEstimulo;
        db.collection('pacientes').doc(pacienteSelecionado.id).update({ atividades: pacienteSelecionado.atividades }).then(() => {
            atualizarListaRegistros();
        });
    } else {
        alert('Por favor, preencha o campo nome do estímulo.');
    }
}

function deletarRegistro(index) {
    if (confirm(`Deletar registro ${atividadeSelecionada.registros[index].nomeEstimulo}?`)) {
        atividadeSelecionada.registros.splice(index, 1);
        db.collection('pacientes').doc(pacienteSelecionado.id).update({ atividades: pacienteSelecionado.atividades }).then(() => {
            atualizarListaRegistros();
        });
    }
}

function finalizarRegistro(event, index) {
    const registro = atividadeSelecionada.registros[index];
    registro.dataFim = new Date().toISOString();
    db.collection('pacientes').doc(pacienteSelecionado.id).update({ atividades: pacienteSelecionado.atividades }).then(() => {
        atualizarListaRegistros();
    });
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
        const dataAtual = new Date().toLocaleDateString('pt-BR');
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
        const dataAtual = new Date().toLocaleDateString('pt-BR');
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

document.getElementById('imprimirFrequencia').addEventListener('click', () => {
    const tabela = document.getElementById('tabelaFrequencia');
    const conteudo = tabela.outerHTML;
    const janelaImpressao = window.open('', '', 'height=500,width=800');
    janelaImpressao.document.write('<html><head><title>Frequência do Paciente</title></head><body>');
    janelaImpressao.document.write(conteudo);
    janelaImpressao.document.write('</body></html>');
    janelaImpressao.document.close();
    janelaImpressao.print();
    janelaImpressao.close();
});

// Funções auxiliares
function formatarValorMonetario(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Inicialização
atualizarListaPacientes();