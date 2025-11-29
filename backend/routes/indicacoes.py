from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.indicacao import IndicacaoSemana
from models.livro import Livro
from database import db
from decorators import role_required
from datetime import date, datetime
from sqlalchemy import and_

indicacoes_bp = Blueprint("indicacoes_bp", __name__)

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
    
    resultado = []
    for i in indicacoes:
        livro_dados = i.livro.mostrar_dados()
        livro_dados["id_indicacao"] = i.id
        livro_dados["data_inicio"] = i.data_inicio.isoformat()
        livro_dados["data_fim"] = i.data_fim.isoformat()
        resultado.append(livro_dados)

    return jsonify(resultado)

@indicacoes_bp.route("/indicacoes", methods=["POST"])
@jwt_required()
@role_required("FUNCIONARIO")
def criar_indicacao():
    data = request.get_json()
    try:
        indicacao = IndicacaoSemana(
            livro_id=data["livro_id"],
            data_inicio=datetime.strptime(data["data_inicio"], "%Y-%m-%d").date(),
            data_fim=datetime.strptime(data["data_fim"], "%Y-%m-%d").date()
        )
        db.session.add(indicacao)
        db.session.commit()
        return jsonify({"msg": "Indicação criada com sucesso"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Erro ao criar indicação", "error": str(e)}), 400

@indicacoes_bp.route("/indicacoes/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("FUNCIONARIO")
def deletar_indicacao(id):
    indicacao = IndicacaoSemana.query.get_or_404(id)
    db.session.delete(indicacao)
    db.session.commit()
    return jsonify({"msg": "Indicação removida com sucesso"})