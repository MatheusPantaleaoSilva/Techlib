from flask import Blueprint, request, jsonify
from database import db
from models.categoria import Categoria
from decorators import role_required
from flask_jwt_extended import jwt_required

categorias_bp = Blueprint("categorias", __name__)

@categorias_bp.route("/categorias", methods=["GET"])
@jwt_required()
def listar_categorias():
    categorias = Categoria.query.all()
    return jsonify([c.mostrar_dados() for c in categorias]), 200

@categorias_bp.route("/categorias", methods=["POST"])
@jwt_required()
@role_required("FUNCIONARIO")
def criar_categoria():
    data = request.json
    nome = data.get("nome")

    if not nome:
        return jsonify({"error": "O nome da categoria é obrigatório"}), 400

    if Categoria.query.filter_by(nome=nome).first():
        return jsonify({"error": "Categoria já existe"}), 400

    nova_categoria = Categoria(nome=nome)
    db.session.add(nova_categoria)
    db.session.commit()
    return jsonify(nova_categoria.mostrar_dados()), 201

@categorias_bp.route("/categorias/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("FUNCIONARIO")
def deletar_categoria(id):
    categoria = Categoria.query.get(id)
    if not categoria:
        return jsonify({"error": "Categoria não encontrada"}), 404
    
    try:
        db.session.delete(categoria)
        db.session.commit()
        return jsonify({"msg": "Categoria removida com sucesso"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao deletar categoria", "detalhes": str(e)}), 400