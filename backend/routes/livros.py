from flask import Blueprint, request, jsonify
from database import db
from models.livro import Livro
from models.pessoa import Pessoa
from models.categoria import Categoria
from decorators import role_required
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from datetime import datetime
from sqlalchemy import or_

livros_bp = Blueprint("livros", __name__)

@livros_bp.route("/livros/<int:id>/favoritar", methods=["POST"])
@jwt_required()
def favoritar_livro(id):
    claims = get_jwt()
    pessoa_id = claims.get("pessoa_id")
    
    if not pessoa_id:
        return jsonify({"error": "Usuário sem perfil de pessoa associado"}), 400

    pessoa = Pessoa.query.get(pessoa_id)
    livro = Livro.query.get_or_404(id)

    if livro in pessoa.favoritos:
        pessoa.favoritos.remove(livro)
        acao = "removido"
        is_fav = False
    else:
        pessoa.favoritos.append(livro)
        acao = "adicionado"
        is_fav = True
    
    db.session.commit()
    return jsonify({"msg": f"Livro {acao} dos favoritos", "favorito": is_fav}), 200

@livros_bp.route("/livros/meus-favoritos-ids", methods=["GET"])
@jwt_required()
def listar_ids_favoritos():
    claims = get_jwt()
    pessoa_id = claims.get("pessoa_id")
    if not pessoa_id: return jsonify([])

    pessoa = Pessoa.query.get(pessoa_id)
    return jsonify([l.id for l in pessoa.favoritos])


@livros_bp.route("/livros", methods=["POST"])
@jwt_required()
@role_required("FUNCIONARIO")
def criar_livro():
    data = request.json
    obrigatorios = ["nome", "autor", "isbn", "categoria_id", "data_aquisicao"]
    for campo in obrigatorios:
        if campo not in data or not data[campo]:
            return jsonify({"error": f"Campo '{campo}' é obrigatório"}), 400

    try:
        if not Categoria.query.get(data["categoria_id"]):
             return jsonify({"error": "Categoria inválida"}), 400

        data_aquisicao_obj = datetime.strptime(data["data_aquisicao"], "%Y-%m-%d").date()

        livro = Livro(
            nome=data["nome"],
            autor=data["autor"],
            isbn=data["isbn"],
            categoria_id=int(data["categoria_id"]),
            data_aquisicao=data_aquisicao_obj,
            imagem_url=data.get("imagem_url"),
            quantidade=int(data.get("quantidade", 1))
        )
        db.session.add(livro)
        db.session.commit()
        return jsonify(livro.mostrar_dados()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@livros_bp.route("/livros", methods=["GET"])
@jwt_required()
def listar_livros():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 8, type=int)
    termo = request.args.get('q', '', type=str)
    
    somente_favoritos = request.args.get('apenas_favoritos', 'false') == 'true'

    query = Livro.query

    if somente_favoritos:
        claims = get_jwt()
        pessoa_id = claims.get("pessoa_id")
        if pessoa_id:
            query = query.join(Pessoa.favoritos).filter(Pessoa.id == pessoa_id)
    
    if termo:
        query = query.outerjoin(Categoria).filter(
            or_(
                Livro.nome.ilike(f'%{termo}%'),
                Livro.autor.ilike(f'%{termo}%'),
                Categoria.nome.ilike(f'%{termo}%')
            )
        )
    
    query = query.order_by(Livro.nome)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "livros": [l.mostrar_dados() for l in pagination.items],
        "total_itens": pagination.total,
        "total_paginas": pagination.pages,
        "pagina_atual": page
    }), 200

@livros_bp.route("/livros/<int:id>", methods=["GET"])
@jwt_required()
def buscar_livro(id):
    livro = Livro.query.get(id)
    if not livro: return jsonify({"error": "Livro não encontrado"}), 404
    return jsonify(livro.mostrar_dados()), 200

@livros_bp.route("/livros/<int:id>", methods=["PUT"])
@jwt_required()
@role_required("FUNCIONARIO")
def atualizar_livro(id):
    livro = Livro.query.get(id)
    if not livro: return jsonify({"error": "Livro não encontrado"}), 404
    data = request.json
    try:
        livro.nome = data.get("nome", livro.nome)
        livro.autor = data.get("autor", livro.autor)
        livro.isbn = data.get("isbn", livro.isbn)
        if "categoria_id" in data: livro.categoria_id = int(data["categoria_id"])
        livro.imagem_url = data.get("imagem_url", livro.imagem_url)
        livro.quantidade = int(data.get("quantidade", livro.quantidade))
        if "data_aquisicao" in data and data["data_aquisicao"]:
             livro.data_aquisicao = datetime.strptime(data["data_aquisicao"], "%Y-%m-%d").date()
        db.session.commit()
        return jsonify(livro.mostrar_dados()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@livros_bp.route("/livros/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("FUNCIONARIO")
def deletar_livro(id):
    livro = Livro.query.get(id)
    if not livro: return jsonify({"error": "Livro não encontrado"}), 404
    try:
        db.session.delete(livro)
        db.session.commit()
        return jsonify({"message": "Livro deletado com sucesso"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao deletar (possível vínculo existente)."}), 400