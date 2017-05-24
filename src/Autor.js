import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from  './TratadorErros';

class FormularioAutor extends Component {

    constructor() {
        super();
        this.state = {
            nome: '',
            email: '',
            senha: ''
        };
        this.enviaForm = this.enviaForm.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/autores',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({
                nome: this.state.nome,
                email: this.state.email,
                senha: this.state.senha
            }),
            success: function (novaListagem) {
                // Disparar um aviso gerar de novaListagem disponivel ($broadcast)
                PubSub.publish('atualiza-lista-autores', novaListagem);

                this.setState({
                    nome: '',
                    email: '',
                    senha: ''
                });
            }.bind(this),
            error: function(resposta){
                if(resposta.status === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function () {
                PubSub.publish('limpar-erros', {});
            }
        })
    }

    salvaAlteracao(nomeInput, evento) {
        let campoAlterado = {};
        campoAlterado[nomeInput] = evento.target.value;
        this.setState(campoAlterado);
    }

    render() {
        return(
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned"
                      onSubmit={this.enviaForm}
                      method="post">
                    <InputCustomizado id="nome" type="text" label="Nome" name="nome"
                                      value={this.state.nome}
                                      onChange={this.salvaAlteracao.bind(this, 'nome')} />
                    <InputCustomizado id="email" type="email" label="E-mail" name="email"
                                      value={this.state.email}
                                      onChange={this.salvaAlteracao.bind(this, 'email')} />
                    <InputCustomizado id="senha" type="password" label="Senha" name="senha"
                                      value={this.state.senha}
                                      onChange={this.salvaAlteracao.bind(this, 'senha')} />

                    <BotaoSubmitCustomizado label="Gravar" />
                </form>
            </div>
        );
    }
}

class TabelaAutores extends Component {

    render() {
        return(
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.lista.map( function (autor) {
                            return (
                                <tr key={autor.id}>
                                    <td>{autor.nome}</td>
                                    <td>{autor.email}</td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class AutorBox extends Component {

    constructor() {
        super();
        this.state = {
            lista : []
        };
    }

    componentDidMount() {
        $.ajax({
            url: 'http://localhost:8080/api/autores',
            dataType: 'json',
            success: function(resposta) {
                this.setState({lista: resposta});
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-autores', function (topico, novaLista) {
            this.setState({lista: novaLista});
        }.bind(this));
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de autores</h1>
                </div>
                <div className="content" id="content">
                    <FormularioAutor />
                    <TabelaAutores lista={this.state.lista} />
                </div>
            </div>
        );
    }
}