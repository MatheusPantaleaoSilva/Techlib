from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.indicacao import IndicacaoSemana
from models.livro import Livro
from database import db
from decorators import role_required
from datetime import date
from datetime import datetime
from sqlalchemy import and_


indicacoes_bp = Blueprint("indicacoes_bp", __name__)

# Buscar indicações da semana
@indicacoes_bp.route("/indicacoes", methods=["GET"])
@jwt_required()
def livros_semana():
    hoje = date.today()
    indicacoes = IndicacaoSemana.query.filter(
        and_(
            IndicacaoSemana.data_inicio <= hoje,
            IndicacaoSemana.data_fim >= hoje
        )
    ).all()
    return jsonify([{
        "id": i.id,
        "livro_id": i.livro.id,
        "nome": i.livro.nome,
        "autor": i.livro.autor,
        "data_inicio": i.data_inicio.isoformat(), 
        "data_fim": i.data_fim.isoformat(),
        "imagem_url": i.livro.imagem_url
    } for i in indicacoes])

# Gerenciar indicações
@indicacoes_bp.route("/indicacoes", methods=["POST"])
@jwt_required()
@role_required("FUNCIONARIO")
def criar_indicacao():
    data = request.get_json()
    indicacao = IndicacaoSemana(
        livro_id=data["livro_id"],
        data_inicio=datetime.strptime(data["data_inicio"], "%Y-%m-%d").date(),
        data_fim=datetime.strptime(data["data_fim"], "%Y-%m-%d").date()
)
    db.session.add(indicacao)
    db.session.commit()
    return jsonify({"msg": "Indicação criada com sucesso"}), 201

# Deletar uma indicação
@indicacoes_bp.route("/indicacoes/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("FUNCIONARIO")
def deletar_indicacao(id):
    indicacao = IndicacaoSemana.query.get_or_404(id)
    db.session.delete(indicacao)
    db.session.commit()
    return jsonify({"msg": "Indicação removida com sucesso"})
