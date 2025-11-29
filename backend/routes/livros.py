from flask import Blueprint, request, jsonify
from database import db
from models.livro import Livro
from models.pessoa import Pessoa
from models.categoria import Categoria
from decorators import role_required
from flask_jwt_extended import jwt_required, get_jwt
from datetime import date
from sqlalchemy import or_

livros_bp = Blueprint("livros", __name__)

@livros_bp.route("/livros/<int:id>/favoritar", methods=["POST"])
@jwt_required()
def favoritar_livro(id):
    claims = get_jwt()
    pessoa_id = claims.get("pessoa_id")
    if not pessoa_id: return jsonify({"error": "Erro de permissão"}), 400
    pessoa = Pessoa.query.get(pessoa_id)
    livro = Livro.query.get_or_404(id)
    if livro in pessoa.favoritos:
        pessoa.favoritos.remove(livro)
        msg, is_fav = "Removido dos favoritos", False
    else:
        pessoa.favoritos.append(livro)
        msg, is_fav = "Adicionado aos favoritos", True
    db.session.commit()
    return jsonify({"msg": msg, "favorito": is_fav}), 200

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
    obrigatorios = ["nome", "autor", "isbn"]
    for campo in obrigatorios:
        if not data.get(campo):
            return jsonify({"error": f"Campo '{campo}' é obrigatório"}), 400

    cat_ids = data.get("categoria_ids", [])
    if not cat_ids or not isinstance(cat_ids, list):
        return jsonify({"error": "Selecione pelo menos uma categoria"}), 400
    
    categorias_objs = Categoria.query.filter(Categoria.id.in_(cat_ids)).all()
    if not categorias_objs:
        return jsonify({"error": "Categorias inválidas"}), 400

    try:
        livro = Livro(
            nome=data["nome"],
            autor=data["autor"],
            isbn=data["isbn"],
            descricao=data.get("descricao", "")[:500],
            data_aquisicao=date.today(),
            imagem_url=data.get("imagem_url"),
            quantidade=int(data.get("quantidade", 1))
        )
        livro.categorias = categorias_objs
        
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
    ver_arquivados = request.args.get('ver_arquivados', 'false') == 'true'

    claims = get_jwt()
    role = claims.get("role")
    query = Livro.query

    if role == "FUNCIONARIO" and ver_arquivados:
        query = query.filter(Livro.ativo == False)
    else:
        query = query.filter(Livro.ativo == True)

    if somente_favoritos:
        pessoa_id = claims.get("pessoa_id")
        if pessoa_id:
            query = query.join(Pessoa.favoritos).filter(Pessoa.id == pessoa_id)
    
    if termo:
        query = query.filter(
            or_(
                Livro.nome.ilike(f'%{termo}%'),
                Livro.autor.ilike(f'%{termo}%'),
                Livro.descricao.ilike(f'%{termo}%'),
                Livro.categorias.any(Categoria.nome.ilike(f'%{termo}%'))
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
        # Atualiza a descrição
        if "descricao" in data:
            livro.descricao = data["descricao"][:500]

        livro.imagem_url = data.get("imagem_url", livro.imagem_url)
        livro.quantidade = int(data.get("quantidade", livro.quantidade))
        
        if "categoria_ids" in data:
            cat_ids = data["categoria_ids"]
            if isinstance(cat_ids, list):
                new_cats = Categoria.query.filter(Categoria.id.in_(cat_ids)).all()
                livro.categorias = new_cats

        if "ativo" in data:
            livro.ativo = bool(data["ativo"])

        db.session.commit()
        return jsonify(livro.mostrar_dados()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@livros_bp.route("/livros/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("FUNCIONARIO")
def deletar_livro(id):
    livro = Livro.query.get(id)
    if not livro: return jsonify({"error": "Livro não encontrado"}), 404
    try:
        livro.ativo = False 
        db.session.commit()
        return jsonify({"message": "Livro arquivado com sucesso"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao arquivar."}), 400