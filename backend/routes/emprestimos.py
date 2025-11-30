from flask import Blueprint, request, jsonify
from database import db
from models.pessoa import Pessoa
from models.livro import Livro  
from models.emprestimo import Emprestimo
from decorators import role_required
from datetime import datetime, timedelta, date
from flask_jwt_extended import jwt_required, get_jwt


emprestimos_bp = Blueprint("emprestimos", __name__)

@emprestimos_bp.route("/emprestimos", methods=["POST"])
@jwt_required()
@role_required("FUNCIONARIO")
def criar_emprestimo():
    data = request.get_json()
    try:
        pessoa_id = data.get("pessoa_id")
        livro_id = data.get("livro_id")
        
        data_str = data.get("data_emprestimo")
        if data_str:
            data_emprestimo_obj = datetime.strptime(data_str, "%Y-%m-%d").date()
        else:
            data_emprestimo_obj = date.today()

        if not Pessoa.query.get(pessoa_id):
            return jsonify({"msg": "Pessoa não encontrada"}), 404
        
        livro = Livro.query.get(livro_id)
        if not livro:
            return jsonify({"msg": "Livro não encontrado"}), 404
            
        emprestimos_ativos = Emprestimo.query.filter_by(livro_id=livro_id, data_devolucao=None).count()
        
        if emprestimos_ativos >= livro.quantidade:
            return jsonify({
                "msg": f"Estoque esgotado! Todos os {livro.quantidade} exemplares estão emprestados."
            }), 400

        emprestimo = Emprestimo(
            pessoa_id=pessoa_id,
            livro_id=livro_id,
            data_emprestimo=data_emprestimo_obj,
            data_devolucao=None
        )

        db.session.add(emprestimo)
        db.session.commit()

        return jsonify({
            "msg": "Empréstimo criado com sucesso",
            "emprestimo": emprestimo.mostrar_dados()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Erro ao criar empréstimo", "erro": str(e)}), 400
    
@emprestimos_bp.route("/emprestimos/<int:id>/devolver", methods=["PUT"])
@jwt_required()
@role_required("FUNCIONARIO")
def devolver_emprestimo(id):
    emprestimo = Emprestimo.query.get(id)

    if not emprestimo:
        return jsonify({"msg": "Empréstimo não encontrado"}), 404
    if emprestimo.data_devolucao is not None:
        return jsonify({"msg": "Este empréstimo já foi devolvido anteriormente"}), 400

    try:
        emprestimo.data_devolucao = date.today()
        db.session.commit()

        return jsonify({
            "msg": "Livro devolvido com sucesso",
            "emprestimo": emprestimo.mostrar_dados()
        }), 200

    except Exception as ex:
        db.session.rollback()
        return jsonify({"msg": "Erro ao registrar devolução", "erro": str(ex)}), 400

@emprestimos_bp.route("/meus-emprestimos", methods=["GET"])
@jwt_required()
def meus_emprestimos():
    claims = get_jwt()
    pessoa_id = claims.get("pessoa_id")
    if not pessoa_id:
         return jsonify([])
         
    emprestimos = Emprestimo.query.filter_by(pessoa_id=pessoa_id).all()
    return jsonify([e.mostrar_dados() for e in emprestimos])

@emprestimos_bp.route("/emprestimos", methods=["GET"])
@jwt_required()
@role_required("CLIENTE", "FUNCIONARIO")
def listar_emprestimos():
    emprestimos = Emprestimo.query.all()
    return jsonify([e.mostrar_dados() for e in emprestimos])

@emprestimos_bp.route("/emprestimos/<int:id>", methods=["GET"])
@jwt_required()
@role_required("CLIENTE", "FUNCIONARIO")
def buscar_emprestimo(id):
    e = Emprestimo.query.get(id)
    if not e:
        return jsonify({"msg": "Empréstimo não encontrado"}), 404
    return jsonify(e.mostrar_dados())

@emprestimos_bp.route("/emprestimos/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("FUNCIONARIO")
def deletar_emprestimo(id):
    e = Emprestimo.query.get(id)
    if not e:
        return jsonify({"msg": "Empréstimo não encontrado"}), 404

    try:
        db.session.delete(e)
        db.session.commit()
        return jsonify({"msg": "Empréstimo deletado com sucesso"})
    except Exception as ex:
        db.session.rollback()
        return jsonify({"msg": "Erro ao deletar empréstimo", "erro": str(ex)}), 400
    
@emprestimos_bp.route("/relatorios", methods=["GET"])
@jwt_required()
@role_required("FUNCIONARIO")
def relatorios():
    emprestimos = Emprestimo.query.all()
    
    total_emprestimos = len(emprestimos)
    ativos = sum(1 for e in emprestimos if e.data_devolucao is None)
    devolvidos = total_emprestimos - ativos

    hoje = date.today()
    atrasados = 0
    for e in emprestimos:
        if e.data_devolucao is None:
            prazo = e.data_emprestimo + timedelta(days=7)
            if hoje > prazo:
                atrasados += 1

    livros_count = {}
    for e in emprestimos:
        nome_livro = e.livro.nome if e.livro else "Livro Deletado"
        livros_count[nome_livro] = livros_count.get(nome_livro, 0) + 1
        
    livros_mais_emprestados = [{"nome": nome, "qtd": qtd} 
                               for nome, qtd in livros_count.items()]
    
    livros_mais_emprestados.sort(key=lambda x: x["qtd"], reverse=True)

    return jsonify({
        "total_emprestimos": total_emprestimos,
        "ativos": ativos,
        "devolvidos": devolvidos,
        "atrasados": atrasados,
        "livros_mais_emprestados": livros_mais_emprestados
    })