import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from  './TratadorErros';

export default class LivroBox extends Component {

    constructor() {
        super();
        this.state = {
            livros : [],
            autores : []
        };
    }

    componentDidMount() {
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            dataType: 'json',
            type: 'get',
            success: function(resposta) {
                this.setState({livros: resposta});
            }.bind(this)
        });


        $.ajax({
            url: 'http://localhost:8080/api/autores',
            dataType: 'json',
            type: 'get',
            success: function(resposta) {
                this.setState({autores: resposta});
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-livros', function (topico, novaLista) {
            this.setState({livros: novaLista});
        }.bind(this));
    }

    render() {
        return(
            <div>
                <div className="header">
                    <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores} />
                    <TabelaLivros listaLivros={this.state.livros} />
                </div>
            </div>
        );
    }
}

class FormularioLivro extends Component {

    constructor() {
        super();
        this.state = {
            titulo: '',
            preco: '',
            autorId: ''
        };
        this.enviaForm = this.enviaForm.bind(this);

        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco = this.setPreco.bind(this);
        this.setIdAutor = this.setIdAutor.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({
                titulo: this.state.titulo,
                preco: this.state.preco,
                autorId: this.state.autorId
            }),
            success: function (novaListagem) {
                // Disparar um aviso gerar de novaListagem disponivel ($broadcast)
                PubSub.publish('atualiza-lista-livros', novaListagem);

                this.setState({
                    titulo: '',
                    preco: '',
                    autorId: ''
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

    setTitulo(evento) {
        this.setState({titulo: evento.target.value});
    }

    setPreco(evento) {
        this.setState({preco: evento.target.value});
    }

    setIdAutor(evento) {
        this.setState({autorId: evento.target.value});
    }

    render() {
        return(
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned"
                      onSubmit={this.enviaForm}
                      method="post">
                    <InputCustomizado id="titulo" type="text" label="Titulo" name="titulo" value={this.state.titulo} onChange={this.setTitulo} />
                    <InputCustomizado id="preco" type="text" label="Preço" name="preco" value={this.state.preco} onChange={this.setPreco} />

                    <div className="pure-control-group">
                        <label htmlFor="autorId">
                            Autor
                        </label>
                        <select id="autorId" name="autorId" onChange={this.setIdAutor} value={this.state.autorId}>
                            <option value="">Selecione um autor</option>
                            {
                                this.props.autores.map(function (autor) {
                                    return <option value={autor.id} key={autor.id}>{autor.nome}</option>
                                })
                            }
                        </select>
                    </div>

                    <BotaoSubmitCustomizado label="Gravar" />
                </form>
            </div>
        );
    }
}

class TabelaLivros extends Component {

    render() {
        return(
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Titulo</th>
                        <th>Preco</th>
                        <th>Autor</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.listaLivros.map( function (livro) {
                            return (
                                <tr key={livro.id}>
                                    <td>{livro.titulo}</td>
                                    <td>{livro.preco}</td>
                                    <td>{livro.autor.nome}</td>
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