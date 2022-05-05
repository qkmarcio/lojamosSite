var jsProfessor = {};

var formCadastro;

jsProfessor.mask = function () {
    $("#prof_telefone").mask('(99) 99999-9999');
    $("#prof_comissao").mask('99.999');
};

jsProfessor.eventos = function () {
    //$('input:text').setMask();

    $('#image-file').on('change', function () {
        console.log('This file size is: ' + this.files[0].size / 1024 / 1024 + "MiB");
    });
    
    $('#inpBuscar').focus();
    $('#inpBuscar').on('change', function (evet) {

        let FData = new FormData();
        FData.set("action", "vBuscaAll");//nome da funcao no PHP
        FData.set("where", evet.target.value);//passo os campos PHP

        var json = jsProfessor.ajax(FData);

        try {
            jsProfessor.tableList(json);

        } catch (erro) {
            $('#ListView').empty();
            $('#ListView').append("<tr>PROFESSORES N�O LOCALIZADO !</tr>");
        }

        console.log(evet.target.value);
    });

    //Faz a Chamada para Editar
    $('#thumbnail').on('click', function (e) {
        $("#prof_foto").click();
    });

    $('#prof_foto').change(function (e) {
        var img = e.target.files
        if (img.length <= 0) {
            return;
        } else {
            if (img[0].size >= 2306867) {
                swal('Oops...', 'Imagem muito grande!! Max: 2MB', 'info');
                e.target.value = '';
            } else {
                let reader = new FileReader();
                reader.onload = function (evt) {
                    $('#thumbnail').attr('src', evt.target.result);
                }
                reader.readAsDataURL(img[0]);
            }
        }

    });

    //escuta o click da class .btn-link da lista de professores
    $('table').on('click', '.btn-link', function (e) {
        var id = $(this).closest('tr').children('td:first').text();
        jsProfessor.editar(id);
    });

    //Quando o Form esta show modal
    $('#formCadastro').on('shown.bs.modal', function () {
        $("#prof_nome").focus();
        jsProfessor.ValidaForm();
    });

    //Quando o Form esta hide modal
    $('#formCadastro').on('hide.bs.modal', function () {
        $("#inpBuscar").focus();
        $('#formCadastro input,textarea,select').each(function () {
            $(this).val('');
        });

        if (formCadastro.valid() == false) {
            formCadastro.destroy();
        }

        //Deixa o Form padr�o para fazer o insert
        $("#insert").val('insert');
        $('#thumbnail').attr('src', "../Fotos/semfoto.jpg");
    });

    //Grava um novo Registro ou Altera if $("#insert").val() esta com update
//    $('#Gravar').click(function () {
//    //vai para o js
//    });

//    $('#formCadastro').on("submit", function (event) {
//        $form = $(this); //wrap this in jQuery
//        console.log(formCadastro.validate().form());
//    });
};

jsProfessor.listarPassageiros = function () {
    $('#integrantes').val('');
    for (var i = 0; i < jsProfessor.arrayIntegrantes.length; i++) {
        var obj = jsProfessor.arrayIntegrantes[i];
        var v = $('#integrantes').val();
        $('#integrantes').val(v + obj.pas_nome + '\n');
    }
};
// O submit do form que chama esta funcao
jsProfessor.ValidaForm = function () {

    formCadastro = $('#formCadastro').validate({
        debug: true,
        ignore: '*:not([name])',
        rules: {
            prof_nome: {
                required: true,
                minlength: 3
            },
            prof_sobrenome: {
                required: true,
                minlength: 3
            },
            prof_email: {
                required: true,
                email: true
            },
            prof_sexo: {
                required: true
            },
            prof_ativado: {
                required: true
            }
        },
        messages: {
            prof_nome: {
                required: "Coloque um nome",
                minlength: "Seu nome deve consistir em pelo menos 3 caracteres"
            },
            prof_sobrenome: {
                required: "Por favor coloque um Sobrenome",
                minlength: "Seu Sobrenome deve consistir em pelo menos 3 caracteres"
            },
            prof_email: "Coloque um email valido",
            prof_sexo: {
                required: "Selecionar o Sexo",

            },
            prof_ativado: {
                required: "Marca Op��o",

            }
        },
        submitHandler: function (form) {
            //alert('inside');

            let Form = jsProfessor.getForm();

            Form.set("action", "vCadastro"); //nome da funcao no PHP

            if (jsProfessor.ajax(Form, 'vCadastro')) {
                $("#formCadastro").modal('hide');

                jsProfessor.getlista();

                swal('Registo...', jsProfessor.msg, 'success');
            }

        }
    });
}

jsProfessor.getForm = function () {

    let FData = new FormData();
    FData.set('insert', $("#insert").val());
    FData.set('id', $("#prof_id").val());
    FData.set('nome', $("#prof_nome").val());
    FData.set('sobrenome', $("#prof_sobrenome").val());
    FData.set('nascimento', $("#prof_nascimento").val());
    FData.set('telefone', $("#prof_telefone").val());
    FData.set('sexo', $("#prof_sexo").val());
    FData.set('email', $("#prof_email").val());
    FData.set('endereco', $("#prof_endereco").val());
    FData.set('obs', $("#prof_obs").val());
    FData.set('senha', $("#prof_senha").val());
    FData.set('ativado', $("#prof_ativado").val());
    FData.set('comissao', $("#prof_comissao").val());
    FData.set('foto', $("#prof_foto")[0].files[0]);
    FData.set('foto2', $("#thumbnail").attr('src'));

    return FData;

};

jsProfessor.setForm = function (obj) {
    $("#prof_id").val(obj.id);
    $("#prof_nome").val(obj.nome);
    $("#prof_sobrenome").val(obj.sobrenome);
    $("#prof_nascimento").val(obj.nascimento);
    $("#prof_telefone").val(obj.telefone);
    $("#prof_sexo").val(obj.sexo);
    $("#prof_email").val(obj.email);
    $("#prof_endereco").val(obj.endereco);
    $("#prof_obs").val(obj.obs);
    $("#prof_senha").val(obj.senha);
    $("#prof_ativado").val(obj.ativado);
    $("#prof_comissao").val(obj.comissao);
    $('#thumbnail').attr('src', obj.foto);
    //$("#prof_foto").val(obj.foto);
};

jsProfessor.tableList = function (json) {
    var linha = '';
    var dados = json.dados;

    for (var i = 0; i < dados.length; i++) {

        switch (dados[i].ativado) {
            case '0':
                classe = "label label-danger";
                ativado = "INATIVO";
                break;
            case '1':
                classe = "label label-success";
                ativado = "ATIVO";
                break;
                    }

        linha += '<tr class="visualiar">' +
                '<td class="col-1 text-center">' + dados[i].id + '</td>' +
                '<td class="col-3 text-left">' + dados[i].nome + '</td>' +
                '<td class="col-2 text-left">' + dados[i].telefone + ' </td>' +
                '<td class="col-3 text-left">' + dados[i].email + ' </td>' +
                '<td class="col-2 text-center" ><span class="' + classe + '">' + ativado + '</span> </td>' +
                '<td class="col-1 text-center" style="min-width: 100px;">\n\
                    <i class="btn-link fa fa-edit fa-lg" title="Visualizar"></i>\n\
                    <i class="btn-link fa fa-edit fa-lg" title="Editar"></i>\n\
                </td>' +
                '</tr>';
    }

    $('#ListView').empty();
    $('#ListView').append(linha);
};

jsProfessor.getlista = function () {

    let FData = new FormData();
    FData.set("action", "vListaAll");//nome da funcao no PHP

    var json = jsProfessor.ajax(FData);

    try {
        jsProfessor.tableList(json);

//        records = json.dados;
//        console.log(records);
//        totalRecords = json.total;
//        totalPages = Math.ceil(totalRecords / recPerPage);
//        jsProfessor.apply_pagination();

    } catch (erro) {
        $('#ListView').empty();
        $('#ListView').append("<tr>PROFESSORES N�O LOCALIZADO !</tr>");
    }
};

jsProfessor.salvar = function () {

    let Form = jsProfessor.getForm();

    Form.set("action", "vCadastro"); //nome da funcao no PHP

    if (jsProfessor.ajax(Form, 'vCadastro')) {
        $("#formCadastro").modal('hide');

        jsProfessor.getlista();

        swal('Registo...', jsProfessor.msg, 'success');
    }
};

jsProfessor.editar = function (id) {

    let FData = new FormData();
    FData.set("action", "vListaAll"); //nome da funcao no PHP
    FData.set("where", "where prof_id=" + id);//passo os campos PHP

    var json = jsProfessor.ajax(FData, 'vLocalizar');

    jsProfessor.setForm(json.dados[0]);

    $(".modal-title").text('Editar Cadastro');
    $("#insert").val('update')
    $("#formCadastro").modal("show");
};
//
//jsProfessor.eventosDaTable = function () {
//
//    $('#ListView tr').each(function () {
//        var codigo;
//        $('td', $(this)).each(function (index, item) {
//            if (index === 0) {
//                codigo = $(item).text();
//            }
//        });
//        $(this).click(function () {
//            jsProfessor.editar(codigo);
//        }).css('cursor', 'pointer');
//    });
//};

//jsProfessor.apply_pagination = function () {
//    jsProfessor.pagination.twbsPagination({
//        totalPages: totalPages,
//        visiblePages: 6,
//        onPageClick: function (event, page) {
//            displayRecordsIndex = Math.max(page - 1, 0) * recPerPage;
//            endRec = (displayRecordsIndex) + recPerPage;
//            //console.log(displayRecordsIndex + 'ssssssssss' + endRec);
//            displayRecords = records.slice(displayRecordsIndex, endRec);
//            jsProfessor.generate_table();
//        }
//    });
//};

//jsProfessor.generate_table = function () {
//    var tr;
//
//    $('#ListView').html('');
//    for (var i = 0; i < displayRecords.length; i++) {
//
//        var classe = "label label-danger";
//
//        if (displayRecords[i].ativado === "ATIVO") {
//            classe = "label label-success";
//        }
//
//        tr = $('<tr/>');
//        tr.append("<td class='col-1'>" + displayRecords[i].id + "</td>");
//        tr.append("<td class='col-4'>>" + displayRecords[i].nome + " " + displayRecords[i].sobrenome + "</td>");
//        tr.append("<td class='col-3'>>" + displayRecords[i].telefone + "</td>");
//        tr.append("<td class='col-2'>>" + displayRecords[i].email + "</td>");
//        tr.append("<td class='col-1'>><span class='" + classe + "' >" + displayRecords[i].ativado + "</span> </td>");
//        tr.append("<td class='col-1'>><i class='btn-editar btn-link fa fa-edit fa-lg'></i></td>");
//        $('#ListView').append(tr);
//    }
//
//};

//jsProfessor.arrayIntegrantes = new Array();

//Define a pagina��o da tabela
//jsProfessor.pagination = $('#pagination'),
//        totalRecords = 0, records = [],
//        displayRecords = [],
//        recPerPage = 3,
//        page = 1,
//        totalPages = 0;

jsProfessor.ajax = function (FormData, action, v) {
    var view = v == null ? '../view/vProfessor.php' : v;
    var retorno;
    $.ajax({
        url: view, type: "POST", data: FormData, dataType: "json", async: false, processData: false, contentType: false,
        success: function (php) {
            jsProfessor.msg = php.messages;
            retorno = php;
        },
        error: function (php) {
            //debugger;
            //var responseText = JSON.parse(php.responseText);
            jsProfessor.msg = php.responseText;
            swal('Oops...', jsProfessor.msg, 'error');

            retorno = false;
        }
    });
    return retorno;

};
jsProfessor.start = function () {
    jsProfessor.eventos();

    jsProfessor.mask();

    jsProfessor.getlista();

};

jsProfessor.start();


